export type CreateUploadUrlInput = {
  key: string;
  contentType: string;
  expiresIn?: number;
};

export type CreateUploadUrlOutput = {
  uploadUrl: string;
  publicUrl: string;
};

export type StorageProvider = {
  createUploadUrl: (input: CreateUploadUrlInput) => Promise<CreateUploadUrlOutput>;
};
