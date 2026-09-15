import { bulkArchiveContacts, bulkDeleteContacts } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { ContactId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const policies = { organization: 'required', auth: 'required' } as const;
const context = (req: any) => ({
  organizationId: req.organization.organizationId as OrganizationId,
  userId: req.auth.userId as UserId,
});
const ids = (req: any) => ((req.body as { contactIds?: ContactId[]; ids?: ContactId[] })?.contactIds
  ?? (req.body as { ids?: ContactId[] })?.ids
  ?? []);

export const bulkContactRoutes = [
  makeFastifyRoute(RouteMethod.POST, '/bulk/archive', verifyJwt, policies, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await bulkArchiveContacts(ids(req), organizationId, userId));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/bulk', verifyJwt, policies, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await bulkDeleteContacts(ids(req), organizationId, userId));
  }),
];
