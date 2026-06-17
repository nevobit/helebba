import { getProductBySlug } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { verifyJwt } from '@hlb/security';
import { OrganizationId } from '@hlb/contracts';

export const getBySlugRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/by-slug/:slug',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const organizationId = req.organization?.organizationId as OrganizationId;
    const product = getProductBySlug(organizationId, slug);
    reply.status(200).send(product);
  },
);
