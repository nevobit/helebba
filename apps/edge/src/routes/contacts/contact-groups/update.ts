import { updateContactGroup } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type ContactGroup, type GroupId, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateContactGroupRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:groupId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { groupId } = req.params as { groupId: GroupId };
    const group = await updateContactGroup(
      groupId,
      req.organization.organizationId as OrganizationId,
      { ...(req.body as Partial<ContactGroup>), updatedBy: req.auth.userId as UserId },
    );
    reply.status(200).send(group);
  },
);
