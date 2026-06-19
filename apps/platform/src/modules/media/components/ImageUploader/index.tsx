import { useRef, useState } from 'react';
import { Button } from '@hlb/design-system';
import { ImageIcon, UploadIcon, XIcon } from 'lucide-react';
import { useUploadImage } from '../../hooks';
import type { UploadedImage } from '../../types';
import styles from './ImageUploader.module.css';

type ImageUploaderProps = {
  label?: string;
  folder?: string;
  value?: string;
  disabled?: boolean;
  onChange: (image: UploadedImage | null) => void;
};

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/svg+xml';

export const ImageUploader = ({
  label = 'Imagen',
  folder = 'media/images',
  value,
  disabled,
  onChange,
}: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState(value ?? '');
  const { uploadImageAsync, isUploadingImage } = useUploadImage();

  const openFilePicker = () => {
    if (disabled || isUploadingImage) return;

    inputRef.current?.click();
  };

  const clearImage = () => {
    setPreviewUrl('');
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    try {
      const uploadedImage = await uploadImageAsync({
        file,
        folder,
      });

      setPreviewUrl(uploadedImage.url);
      onChange(uploadedImage);
    } catch {
      setPreviewUrl(value ?? '');
      onChange(null);
    } finally {
      URL.revokeObjectURL(localPreviewUrl);
    }
  };

  return (
    <div className={styles.root}>
      <span className={styles.label}>{label}</span>

      <div className={styles.control}>
        <button
          className={styles.preview}
          type="button"
          disabled={disabled || isUploadingImage}
          onClick={openFilePicker}
          aria-label="Seleccionar imagen"
        >
          {previewUrl ? (
            <img className={styles.image} src={previewUrl} alt="" />
          ) : (
            <span className={styles.placeholder}>
              <ImageIcon size={20} />
            </span>
          )}
        </button>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploadingImage}
            onClick={openFilePicker}
          >
            <UploadIcon size={16} />
            {isUploadingImage ? 'Subiendo...' : 'Subir imagen'}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled || isUploadingImage}
              onClick={clearImage}
            >
              <XIcon size={16} />
              Quitar
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        disabled={disabled || isUploadingImage}
        onChange={handleFileChange}
      />
    </div>
  );
};
