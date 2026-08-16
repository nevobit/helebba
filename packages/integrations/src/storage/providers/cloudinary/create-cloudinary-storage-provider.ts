import { createHash } from 'crypto';
import type { CreateUploadUrlInput, CreateUploadUrlOutput, StorageProvider } from '../../contracts';

export type CreateCloudinaryStorageProviderConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

const removeFileExtension = (value: string) => value.replace(/\.[^/.]+$/, '');

export const createCloudinaryStorageProvider = ({
  cloudName,
  apiKey,
  apiSecret,
}: CreateCloudinaryStorageProviderConfig): StorageProvider => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
  }

  const createUploadUrl = async ({ key }: CreateUploadUrlInput): Promise<CreateUploadUrlOutput> => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const publicId = removeFileExtension(key);
    const signature = createHash('sha256')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      method: 'POST',
      fields: {
        api_key: apiKey,
        public_id: publicId,
        signature,
        timestamp,
      },
    };
  };

  return { createUploadUrl };
};
