import { updateBrand } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type BrandId, type InventoryBrand, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateBrandRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:brandId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { brandId } = req.params as { brandId: BrandId };
    const brand = await updateBrand(brandId, req.organization.organizationId as OrganizationId, {
      ...(req.body as Partial<InventoryBrand>),
      updatedBy: req.auth.userId as UserId,
    });
    reply.status(200).send(brand);
  },
);
