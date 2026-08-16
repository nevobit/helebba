import { createAwsS3StorageProvider, createCloudinaryStorageProvider, createS3Client } from '../providers';

export type StorageProviderName = 'aws-s3' | 'cloudinary';

export type CreateStorageProviderConfig = {
  provider: StorageProviderName;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket?: string;
  publicBaseUrl?: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
};

export const createStorageProvider = ({
  provider,
  region,
  accessKeyId,
  secretAccessKey,
  bucket,
  publicBaseUrl,
  cloudinaryCloudName,
  cloudinaryApiKey,
  cloudinaryApiSecret,
}: CreateStorageProviderConfig) => {
  if (provider === 'cloudinary') {
    return createCloudinaryStorageProvider({
      cloudName: cloudinaryCloudName ?? '',
      apiKey: cloudinaryApiKey ?? '',
      apiSecret: cloudinaryApiSecret ?? '',
    });
  }

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error('AWS S3 storage configuration is incomplete.');
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
