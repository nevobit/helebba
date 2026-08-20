import { updatePriceList } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type PriceListId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updatePriceListRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:priceListId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = (req.body ?? {}) as { name?: string; currency?: string; description?: string };
    const { priceListId } = req.params as { priceListId: PriceListId };
    const { userId } = req.auth as unknown as { userId: UserId };

    const priceList = await updatePriceList({
      priceListId,
      organizationId: req.organization?.organizationId as OrganizationId,
      name: body.name,
      currency: body.currency,
      description: body.description,
      updatedBy: userId,
    });
    reply.status(200).send(priceList);
  },
);