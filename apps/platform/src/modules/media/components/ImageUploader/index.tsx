import { useRef, useState, type DragEvent } from 'react';
import { UploadIcon, XIcon } from 'lucide-react';
import { useUploadImage } from '../../hooks';
import styles from './ImageUploader.module.css';

type ImageUploaderProps = {
  folder?: string;
  value?: string[];
  disabled?: boolean;
  onChange: (images: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
};

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/svg+xml';
const ACCEPTED_IMAGE_TYPE_SET = new Set(ACCEPTED_IMAGE_TYPES.split(','));
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const ImageUploader = ({
  folder = 'media/images',
  value = [],
  disabled,
  onChange,
  onUploadingChange,
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const { uploadImageAsync, isUploadingImage } = useUploadImage();

  const isDisabled = disabled || isUploadingImage;

  const openFilePicker = () => {
    if (!isDisabled) inputRef.current?.click();
  };

  const uploadFiles = async (files: File[]) => {
    if (isDisabled || files.length === 0) return;

    const validFiles = files.filter(
      (file) => ACCEPTED_IMAGE_TYPE_SET.has(file.type) && file.size <= MAX_IMAGE_SIZE,
    );

    if (validFiles.length !== files.length) {
      setError('Algunos archivos no son imágenes compatibles o superan los 5 MB.');
    } else {
      setError('');
    }

    if (validFiles.length === 0) return;

    onUploadingChange?.(true);
    const uploadedUrls: string[] = [];
    let failedUploads = 0;

    for (const file of validFiles) {
      try {
        const uploadedImage = await uploadImageAsync({ file, folder });
        uploadedUrls.push(uploadedImage.url);
      } catch {
        failedUploads += 1;
      }
    }

    if (uploadedUrls.length > 0) onChange([...value, ...uploadedUrls]);
    if (failedUploads > 0) setError('No pudimos subir una o más imágenes. Inténtalo nuevamente.');

    onUploadingChange?.(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void uploadFiles(Array.from(event.dataTransfer.files));
  };

  const removeImage = (imageIndex: number) => {
    onChange(value.filter((_, index) => index !== imageIndex));
  };

  return (
    <div className={styles.root}>
      {value.length === 0 ? (
        <button
          className={`${styles.emptyDropzone} ${isDragging ? styles.dragging : ''}`}
          type="button"
          disabled={isDisabled}
          onClick={openFilePicker}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <UploadIcon size={28} />
          <span>{isUploadingImage ? 'Subiendo imágenes...' : 'Selecciona o arrastra aquí tus archivos'}</span>
          <small>Hasta 5 MB por imagen (JPEG, PNG, WebP o SVG)</small>
        </button>
      ) : (
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img src={value[0]} alt="Imagen principal del producto" />
            <button
              className={styles.removeButton}
              type="button"
              disabled={isDisabled}
              onClick={() => removeImage(0)}
              aria-label="Quitar imagen principal"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div className={styles.thumbnails}>
            {value.slice(1).map((image, index) => (
              <div className={styles.thumbnail} key={`${image}-${index}`}>
                <img src={image} alt={`Imagen adicional ${index + 1} del producto`} />
                <button
                  className={styles.removeButton}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => removeImage(index + 1)}
                  aria-label={`Quitar imagen adicional ${index + 1}`}
                >
                  <XIcon size={14} />
                </button>
              </div>
            ))}

            <button
              className={`${styles.addButton} ${isDragging ? styles.dragging : ''}`}
              type="button"
              disabled={isDisabled}
              onClick={openFilePicker}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              aria-label="Agregar imágenes"
            >
              <UploadIcon size={25} />
            </button>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        multiple
        disabled={isDisabled}
        onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))}
      />
    </div>
  );
};
