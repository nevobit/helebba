import { deleteBrand } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type BrandId, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deleteBrandRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:brandId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { brandId } = req.params as { brandId: BrandId };
    const deleted = await deleteBrand(
      brandId,
      req.organization.organizationId as OrganizationId,
      req.auth.userId as UserId,
    );
    reply.status(200).send(deleted);
  },
);
