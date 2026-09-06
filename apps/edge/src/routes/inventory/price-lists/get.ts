import { getPriceListById } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type PriceListId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getPriceListRoute = makeFastifyRoute(RouteMethod.GET, '/:priceListId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { priceListId } = req.params as { priceListId: PriceListId };
  const item = await getPriceListById(priceListId, req.organization?.organizationId as OrganizationId);
  reply.status(item ? 200 : 404).send(item ?? { message: 'Tarifa no encontrada.' });
});
