import { deleteProductNote } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductId, type ProductNoteId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deleteProductNoteRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:productId/notes/:noteId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId, noteId } = req.params as { productId: ProductId; noteId: ProductNoteId };
    await deleteProductNote({
      noteId,
      productId,
      organizationId: req.organization?.organizationId as OrganizationId,
    });
    reply.status(200).send(true);
  },
);
