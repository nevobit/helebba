import { randomUUID } from 'crypto';
import { getFileExtension, isSupportedImageType, sanitizeStorageFolder } from '@hlb/foundation';
import { getStorageProvider } from '@hlb/constant-definitions';

const MAX_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;
const UPLOAD_URL_EXPIRATION_SECONDS = 300;
const DEFAULT_UPLOAD_FOLDER = 'media/images';

export type CreatePresignedUploadUrlInput = {
  organizationId: string;
  filename: string;
  contentType: string;
  size: number;
  folder?: string;
};

export type CreatePresignedUploadUrlOutput = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  contentType: string;
  size: number;
  expiresIn: number;
};

const createStorageObjectKey = ({
  organizationId,
  folder,
  filename,
}: {
  organizationId: string;
  folder?: string;
  filename: string;
}) => {
  const safeFolder =
    sanitizeStorageFolder(folder ?? DEFAULT_UPLOAD_FOLDER) || DEFAULT_UPLOAD_FOLDER;
  const extension = getFileExtension(filename);

  return ['organizations', organizationId, safeFolder, `${randomUUID()}${extension}`].join('/');
};

export const createPresignedUploadUrl = async ({
  organizationId,
  filename,
  contentType,
  size,
  folder,
}: CreatePresignedUploadUrlInput): Promise<CreatePresignedUploadUrlOutput> => {
  if (!isSupportedImageType(contentType)) {
    throw new Error('Tipo de imagen no permitido.');
  }

  if (size > MAX_IMAGE_SIZE_IN_BYTES) {
    throw new Error('La imagen no puede pesar más de 5MB.');
  }

  const storageProvider = getStorageProvider();

  const key = createStorageObjectKey({
    organizationId,
    folder,
    filename,
  });

  const upload = await storageProvider.createUploadUrl({
    key,
    contentType,
    expiresIn: UPLOAD_URL_EXPIRATION_SECONDS,
  });

  return {
    key,
    uploadUrl: upload.uploadUrl,
    publicUrl: upload.publicUrl,
    contentType,
    size,
    expiresIn: UPLOAD_URL_EXPIRATION_SECONDS,
  };
};
