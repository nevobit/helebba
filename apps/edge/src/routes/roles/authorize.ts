import { Collection, getModel } from '@hlb/constant-definitions';
import { type Role, RoleSchemaMongo } from '@hlb/contracts';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { problem } from '../access/auth/responses';

const normalize = (value: string) => value.trim().toLowerCase();

const hasPermission = (permissionKeys: readonly string[], required: string) => {
  const [requiredResource, requiredAction] = normalize(required).split(':');

  return permissionKeys.some((permission) => {
    const [resource, action] = normalize(permission).split(':');
    const resourceMatches = resource === '*' || resource === requiredResource;
    const actionMatches = action === '*' || action === requiredAction;

    return resourceMatches && actionMatches;
  });
};

export const authorizeRolePermission = async (
  req: FastifyRequest,
  reply: FastifyReply,
  requiredPermission: string,
) => {
  const roleId = req.auth?.roleId;
  const organizationId = req.organization?.organizationId;

  if (!roleId || !organizationId) {
    problem(reply, 403, 'Role permission is required', 'role_permission_required');
    return false;
  }

  const model = getModel<Role>(Collection.ROLES, RoleSchemaMongo);
  const role = await model.findOne({ _id: roleId, organizationId });

  if (!role || !hasPermission(role.permissionKeys, requiredPermission)) {
    problem(reply, 403, 'Insufficient role permissions', 'insufficient_role_permissions');
    return false;
  }

  return true;
};
