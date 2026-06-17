import { getAllContacts } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type ContactListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  scope?: 'all' | 'companies' | 'people';
};

export const listContactsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const query = (req.query ?? {}) as ContactListQuery;
    const contacts = await getAllContacts({
      organizationId: req.organization?.organizationId as OrganizationId,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 100),
      search: query.search ?? '',
      scope: query.scope ?? 'all',
    });

    reply.status(200).send(contacts);
  },
);
