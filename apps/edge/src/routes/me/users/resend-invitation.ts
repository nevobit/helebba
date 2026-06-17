import { resendOrganizationInvitation } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type MembershipId, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { problem } from '../../access/auth/responses';
import { authorizeRolePermission } from '../../roles/authorize';

export const resendMyOrganizationInvitationRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/invitations/:membershipId/resend',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    if (!(await authorizeRolePermission(req, reply, 'users:invite'))) return;

    const { membershipId } = req.params as { membershipId: MembershipId };

    try {
      const membership = await resendOrganizationInvitation({
        membershipId,
        organizationId: req.organization?.organizationId as OrganizationId,
        userId: req.auth?.userId as UserId,
      });

      reply.status(200).send(membership);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invitation not found') {
        problem(reply, 404, error.message, 'invitation_not_found');
        return;
      }

      throw error;
    }
  },
);
