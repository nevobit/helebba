import { withPrefix } from '@hlb/constant-definitions';
import type { RouteOptions } from 'fastify';
import { createPresignedUploadUrlRoute } from './create-presigned-upload-url';

export const mediaRoutes: RouteOptions[] = withPrefix('/media', [createPresignedUploadUrlRoute]);
