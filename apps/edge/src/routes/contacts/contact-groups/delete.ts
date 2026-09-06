import { deleteContactGroup } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type GroupId, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deleteContactGroupRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:groupId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { groupId } = req.params as { groupId: GroupId };
    reply
      .status(200)
      .send(
        await deleteContactGroup(
          groupId,
          req.organization.organizationId as OrganizationId,
          req.auth.userId as UserId,
        ),
      );
  },
);
