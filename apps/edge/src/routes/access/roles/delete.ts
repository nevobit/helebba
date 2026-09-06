import { deleteRole } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type RoleId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { problem } from '../access/auth/responses';
import { authorizeRolePermission } from './authorize';

export const deleteRoleRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:roleId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    if (!(await authorizeRolePermission(req, reply, 'roles:delete'))) return;

    const { roleId } = req.params as { roleId: RoleId };

    try {
      const out = await deleteRole({
        organizationId: req.organization?.organizationId as OrganizationId,
        roleId,
        userId: req.auth?.userId as UserId,
      });

      reply.status(200).send(out);
    } catch (error) {
      if (error instanceof Error && error.message === 'Role not found') {
        problem(reply, 404, error.message, 'role_not_found');
        return;
      }

      if (error instanceof Error && error.message === 'System roles cannot be deleted') {
        problem(reply, 400, error.message, 'system_role_immutable');
        return;
      }

      if (error instanceof Error && error.message === 'Role is assigned to members') {
        problem(reply, 409, error.message, 'role_assigned_to_members');
        return;
      }

      throw error;
    }
  },
);
