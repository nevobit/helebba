import { createPresignedUploadUrl } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { verifyJwt } from '@hlb/security';

type CreatePresignedUploadUrlBody = {
  filename: string;
  contentType: string;
  size: number;
  folder?: string;
};

const isValidBody = (body: unknown): body is CreatePresignedUploadUrlBody => {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const value = body as Partial<CreatePresignedUploadUrlBody>;

  return (
    typeof value.filename === 'string' &&
    value.filename.trim().length > 0 &&
    typeof value.contentType === 'string' &&
    value.contentType.trim().length > 0 &&
    typeof value.size === 'number' &&
    Number.isFinite(value.size)
  );
};

export const createPresignedUploadUrlRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/presigned-upload-url',
  verifyJwt,
  {
    auth: 'required',
    organization: 'required',
  },
  async (req, reply) => {
    if (!isValidBody(req.body)) {
      return reply.status(400).send({
        message: 'Solicitud inválida para subir el archivo.',
      });
    }

    const organizationId = req.organization?.organizationId;

    if (!organizationId) {
      return reply.status(401).send({
        message: 'No pudimos determinar la organización activa.',
      });
    }

    try {
      const upload = await createPresignedUploadUrl({
        organizationId,
        filename: req.body.filename,
        contentType: req.body.contentType,
        size: req.body.size,
        folder: req.body.folder,
      });

      return reply.status(201).send(upload);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'No pudimos generar la URL de subida.',
      });
    }
  },
);
