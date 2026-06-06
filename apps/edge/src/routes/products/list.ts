import { getAllProducts } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { OrganizationId, Params, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getAllProductsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (request, reply) => {
    const { params } = request as { params: Params };
    console.log(request.auth);
    const customers = await getAllProducts({
      ...params,
      organizationId: request.organization!.organizationId as OrganizationId,
    });
    return reply.status(200).send(customers);
  },
);
