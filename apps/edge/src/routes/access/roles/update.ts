import { updateRole } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type RoleId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { problem } from '../access/auth/responses';
import { authorizeRolePermission } from './authorize';

type UpdateRoleBody = {
  name?: string;
  description?: string;
  permissionKeys?: string[];
};

export const updateRoleRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:roleId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    if (!(await authorizeRolePermission(req, reply, 'roles:write'))) return;

    const body = (req.body ?? {}) as UpdateRoleBody;
    const { roleId } = req.params as { roleId: RoleId };

    try {
      const role = await updateRole({
        organizationId: req.organization?.organizationId as OrganizationId,
        roleId,
        userId: req.auth?.userId as UserId,
        name: body.name,
        description: body.description,
        permissionKeys: body.permissionKeys,
      });

      reply.status(200).send(role);
    } catch (error) {
      if (error instanceof Error && error.message === 'Role not found') {
        problem(reply, 404, error.message, 'role_not_found');
        return;
      }

      if (error instanceof Error && error.message === 'System roles cannot be edited') {
        problem(reply, 400, error.message, 'system_role_immutable');
        return;
      }

      throw error;
    }
  },
);
