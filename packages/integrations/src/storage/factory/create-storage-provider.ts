import { createAwsS3StorageProvider, createS3Client } from '../providers';

export type StorageProviderName = 'aws-s3';

export type CreateStorageProviderConfig = {
  provider: StorageProviderName;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl?: string;
};

export const createStorageProvider = ({
  provider,
  region,
  accessKeyId,
  secretAccessKey,
  bucket,
  publicBaseUrl,
}: CreateStorageProviderConfig) => {
  if (provider !== 'aws-s3') {
    throw new Error(`Unsupported storage provider: ${provider}`);
  }

  const s3 = createS3Client({
    region,
    accessKeyId,
    secretAccessKey,
  });

  return createAwsS3StorageProvider({
    s3,
    bucket,
    region,
    publicBaseUrl,
  });
};
