import { getAllServices } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type ServiceListQuery = {
  page?: string;
  limit?: string;
  search?: string;
};

export const listServicesRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const query = (req.query ?? {}) as ServiceListQuery;
    const services = await getAllServices({
      organizationId: req.organization?.organizationId as OrganizationId,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 100),
      search: query.search ?? '',
    });

    reply.status(200).send(services);
  },
);
