import { api } from '@/shared/api';
import type { CreatePresignedUploadUrlPayload, PresignedUploadUrl } from '../types';

export const createPresignedUploadUrl = async (payload: CreatePresignedUploadUrlPayload) => {
  const { data } = await api.post<PresignedUploadUrl>('/media/presigned-upload-url', payload);

  return data;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
};

export const uploadFileToPresignedUrl = async (file: File, upload: PresignedUploadUrl) => {
  const isFormUpload = upload.method === 'POST';
  const formData = new FormData();

  if (isFormUpload) {
    Object.entries(upload.fields ?? {}).forEach(([name, value]) => formData.append(name, value));
    formData.append('file', file);
  }

  const response = await fetch(upload.uploadUrl, {
    method: upload.method,
    headers: isFormUpload ? undefined : { 'Content-Type': file.type },
    body: isFormUpload ? formData : file,
  });

  if (!response.ok) {
    throw new Error('No pudimos subir la imagen.');
  }

  if (isFormUpload) {
    const result = (await response.json()) as CloudinaryUploadResponse;

    if (!result.secure_url) {
      throw new Error('Cloudinary no devolvió la URL de la imagen.');
    }

    return result.secure_url;
  }

  return upload.publicUrl;
};
