import { useMutation } from '@tanstack/react-query';
import { createPresignedUploadUrl, uploadFileToPresignedUrl } from '../services';
import type { UploadedImage } from '../types';

type UploadImageInput = {
  file: File;
  folder?: string;
};

export const useUploadImage = () => {
  const mutation = useMutation({
    mutationKey: ['media', 'upload-image'],
    mutationFn: async ({ file, folder }: UploadImageInput): Promise<UploadedImage> => {
      const presigned = await createPresignedUploadUrl({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        folder,
      });

      const uploadedUrl = await uploadFileToPresignedUrl(file, presigned);

      if (!uploadedUrl) {
        throw new Error('No pudimos obtener la URL pública de la imagen.');
      }

      return {
        key: presigned.key,
        url: uploadedUrl,
        mimeType: file.type,
        size: file.size,
      };
    },
  });

  return {
    uploadImage: mutation.mutate,
    uploadImageAsync: mutation.mutateAsync,
    isUploadingImage: mutation.isPending,
    uploadImageError: mutation.error,
  };
};
