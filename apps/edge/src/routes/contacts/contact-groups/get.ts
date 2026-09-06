import { getContactGroup } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type GroupId, type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getContactGroupRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:groupId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { groupId } = req.params as { groupId: GroupId };
    reply
      .status(200)
      .send(await getContactGroup(groupId, req.organization.organizationId as OrganizationId));
  },
);
