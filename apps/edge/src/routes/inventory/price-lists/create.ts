import { createPriceList } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const createPriceListRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = (req.body ?? {}) as { name?: string; currency?: string; description?: string };
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return reply.status(400).send({ message: 'El nombre de la tarifa no puede estar vacío.' });
    }
    const { userId } = req.auth as unknown as { userId: UserId };
    const priceList = await createPriceList({
      organizationId: req.organization?.organizationId as OrganizationId,
      name: body.name,
      currency: body.currency ?? 'COP',
      description: body.description ?? '',
      createdBy: userId,
      updatedBy: userId,
    });
    reply.status(201).send(priceList);
  },
);