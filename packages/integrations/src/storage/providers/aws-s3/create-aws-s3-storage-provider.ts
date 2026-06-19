import { PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { CreateUploadUrlInput, CreateUploadUrlOutput, StorageProvider } from '../../contracts';

export type CreateAwsS3StorageProviderConfig = {
  s3: S3Client;
  bucket: string;
  region: string;
  publicBaseUrl?: string;
};

const DEFAULT_UPLOAD_URL_EXPIRATION_SECONDS = 300;

const removeTrailingSlash = (value: string) => value.replace(/\/$/, '');

export const createAwsS3StorageProvider = ({
  s3,
  bucket,
  region,
  publicBaseUrl,
}: CreateAwsS3StorageProviderConfig): StorageProvider => {
  const buildPublicUrl = (key: string) => {
    if (publicBaseUrl) {
      return `${removeTrailingSlash(publicBaseUrl)}/${key}`;
    }

    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  };

  const createUploadUrl = async ({
    key,
    contentType,
    expiresIn = DEFAULT_UPLOAD_URL_EXPIRATION_SECONDS,
  }: CreateUploadUrlInput): Promise<CreateUploadUrlOutput> => {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn });

    return {
      uploadUrl,
      publicUrl: buildPublicUrl(key),
    };
  };

  return {
    createUploadUrl,
  };
};
