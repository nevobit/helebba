import { S3Client } from '@aws-sdk/client-s3';

export const createS3Client = (config: {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}) =>
  new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
