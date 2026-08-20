import { listProductNotes } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const listProductNotesRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:productId/notes',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId } = req.params as { productId: ProductId };
    const notes = await listProductNotes({
      productId,
      organizationId: req.organization?.organizationId as OrganizationId,
    });
    reply.status(200).send(notes);
  },
);