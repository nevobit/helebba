import { deletePriceList } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type PriceListId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deletePriceListRoute = makeFastifyRoute(RouteMethod.DELETE, '/:priceListId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { priceListId } = req.params as { priceListId: PriceListId };
  const { userId } = req.auth as unknown as { userId: UserId };
  const item = await deletePriceList(priceListId, req.organization?.organizationId as OrganizationId, userId);
  reply.status(item ? 200 : 404).send(item ?? { message: 'Tarifa no encontrada.' });
});
