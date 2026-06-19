import { MonoContext } from '@hlb/kernel';

const STORAGE_PROVIDER_KEY = 'storageProvider';

export type StorageProvider = {
  createUploadUrl: (input: { key: string; contentType: string; expiresIn?: number }) => Promise<{
    uploadUrl: string;
    publicUrl: string;
  }>;
};

export const setStorageProvider = (storageProvider: StorageProvider): void => {
  MonoContext.setState({
    [STORAGE_PROVIDER_KEY]: storageProvider,
  });
};

export const getStorageProvider = () => {
  const storageProvider = MonoContext.getState()[STORAGE_PROVIDER_KEY] as
    | StorageProvider
    | undefined;

  if (!storageProvider) {
    throw new Error('Storage provider is not configured');
  }

  return storageProvider;
};
