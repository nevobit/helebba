import { deleteProductNote } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductNoteId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deleteProductNoteRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:productId/notes/:noteId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { noteId } = req.params as { productId: string; noteId: ProductNoteId };
    await deleteProductNote({
      noteId,
      organizationId: req.organization?.organizationId as OrganizationId,
    });
    reply.status(200).send(true);
  },
);