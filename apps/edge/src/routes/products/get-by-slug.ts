import { getProductBySlug } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { verifyAccessToken } from '@hlb/security';

export const getBySlugRoute = makeFastifyRoute(
    RouteMethod.GET,
    '/:slug',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const {slug} = req.params as {slug: string};
        const companyId = req.tenant.companyId;
        const getedBySlug = getProductBySlug(companyId, slug);
        reply.status(200).send(getProductBySlug);
    }
) 