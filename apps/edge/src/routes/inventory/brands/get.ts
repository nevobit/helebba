import { getBrandById } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type BrandId, type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getBrandRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:brandId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { brandId } = req.params as { brandId: BrandId };
    const brand = await getBrandById(brandId, req.organization.organizationId as OrganizationId);
    reply.status(200).send(brand);
  },
);
