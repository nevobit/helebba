import { inviteOrganizationUser } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type RoleId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { problem } from '../../access/auth/responses';
import { authorizeRolePermission } from '../../roles/authorize';

type InviteOrganizationUserBody = {
  email?: string;
  isAdvisor?: boolean;
  roleId?: RoleId;
};

export const inviteMyOrganizationUserRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/invite',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    if (!(await authorizeRolePermission(req, reply, 'users:invite'))) return;

    const body = (req.body ?? {}) as InviteOrganizationUserBody;

    if (!body.email) {
      problem(reply, 400, 'Email is required', 'email_required');
      return;
    }

    if (!body.roleId) {
      problem(reply, 400, 'Role is required', 'role_required');
      return;
    }

    try {
      const membership = await inviteOrganizationUser({
        email: body.email,
        isAdvisor: body.isAdvisor,
        organizationId: req.organization?.organizationId as OrganizationId,
        roleId: body.roleId,
        invitedBy: req.auth?.userId as UserId,
      });

      reply.status(201).send(membership);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email') {
        problem(reply, 400, error.message, 'invalid_email');
        return;
      }

      if (error instanceof Error && error.message === 'Role not found') {
        problem(reply, 404, error.message, 'role_not_found');
        return;
      }

      if (error instanceof Error && error.message === 'Membership already exists') {
        problem(reply, 409, error.message, 'membership_already_exists');
        return;
      }

      throw error;
    }
  },
);
