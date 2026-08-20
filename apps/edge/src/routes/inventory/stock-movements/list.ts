import { listStockMovements } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const listStockMovementsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:productId/stock-movements',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId } = req.params as { productId: ProductId };
    const query = (req.query ?? {}) as { limit?: string };
    const movements = await listStockMovements({
      productId,
      organizationId: req.organization?.organizationId as OrganizationId,
      limit: Number(query.limit ?? 100),
    });
    reply.status(200).send(movements);
  },
);