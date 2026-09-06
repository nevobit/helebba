import { getProductNote } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductId, type ProductNoteId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getProductNoteRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:productId/notes/:noteId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId, noteId } = req.params as {
      productId: ProductId;
      noteId: ProductNoteId;
    };
    const note = await getProductNote({
      productId,
      noteId,
      organizationId: req.organization?.organizationId as OrganizationId,
    });
    if (!note) return reply.status(404).send({ message: 'La nota no existe.' });
    reply.status(200).send(note);
  },
);
