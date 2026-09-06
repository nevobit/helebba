import { updateProductNote } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import {
  type OrganizationId,
  type ProductId,
  type ProductNoteId,
  type UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateProductNoteRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:productId/notes/:noteId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId, noteId } = req.params as {
      productId: ProductId;
      noteId: ProductNoteId;
    };
    const body = (req.body ?? {}) as { content?: string };
    if (typeof body.content !== 'string' || !body.content.trim())
      return reply.status(400).send({ message: 'La nota no puede estar vacía.' });
    reply.status(200).send(
      await updateProductNote({
        productId,
        noteId,
        organizationId: req.organization?.organizationId as OrganizationId,
        content: body.content,
        updatedBy: (req.auth as unknown as { userId: UserId }).userId,
      }),
    );
  },
);
