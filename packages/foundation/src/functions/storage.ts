export const sanitizeStorageFolder = (folder: string) =>
  folder
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/[^a-zA-Z0-9-_/]/g, '')
    .replace(/\/{2,}/g, '/');

export const getFileExtension = (filename: string) => {
  const extension = filename.split('.').pop()?.trim().toLowerCase();

  return extension ? `.${extension}` : '';
};

export type CreateStorageObjectKeyInput = {
  organizationId: string;
  folder?: string;
  filename: string;
};

export const createStorageObjectKey = ({
  organizationId,
  folder = 'uploads',
  filename,
}: CreateStorageObjectKeyInput) => {
  const safeFolder = sanitizeStorageFolder(folder) || 'uploads';
  const extension = getFileExtension(filename);

  return ['organizations', organizationId, safeFolder, `${crypto.randomUUID()}${extension}`].join(
    '/',
  );
};

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

export const isSupportedImageType = (contentType: string) => SUPPORTED_IMAGE_TYPES.has(contentType);
