import { getProductDocumentStats, getProductSalesStats } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getProductStatsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:productId/stats',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId } = req.params as { productId: ProductId };
    const organizationId = req.organization?.organizationId as OrganizationId;
    const [sales, documents] = await Promise.all([
      getProductSalesStats({ productId, organizationId }),
      getProductDocumentStats({ productId, organizationId }),
    ]);
    reply.status(200).send({ ...sales, ...documents });
  },
);
