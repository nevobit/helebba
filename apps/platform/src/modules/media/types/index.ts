export type CreatePresignedUploadUrlPayload = {
  filename: string;
  contentType: string;
  size: number;
  folder?: string;
};

export type PresignedUploadUrl = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  contentType: string;
  size: number;
  expiresIn: number;
};

export type UploadedImage = {
  key: string;
  url: string;
  mimeType: string;
  size: number;
};
