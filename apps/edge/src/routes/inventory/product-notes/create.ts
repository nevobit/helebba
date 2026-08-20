import { createProductNote } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const createProductNoteRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/:productId/notes',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId } = req.params as { productId: ProductId };
    const body = (req.body ?? {}) as { content?: string };
    if (!body.content || typeof body.content !== 'string' || !body.content.trim()) {
      return reply.status(400).send({ message: 'La nota no puede estar vacía.' });
    }
    const { userId } = req.auth as unknown as { userId: UserId };
    const note = await createProductNote({
      productId,
      organizationId: req.organization?.organizationId as OrganizationId,
      content: body.content,
      createdBy: userId,
    });
    reply.status(201).send(note);
  },
);