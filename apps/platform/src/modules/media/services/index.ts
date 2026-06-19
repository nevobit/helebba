import { api } from '@/shared/api';
import type { CreatePresignedUploadUrlPayload, PresignedUploadUrl } from '../types';

export const createPresignedUploadUrl = async (payload: CreatePresignedUploadUrlPayload) => {
  const { data } = await api.post<PresignedUploadUrl>('/media/presigned-upload-url', payload);

  return data;
};

export const uploadFileToPresignedUrl = async (file: File, uploadUrl: string) => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('No pudimos subir la imagen.');
  }
};
