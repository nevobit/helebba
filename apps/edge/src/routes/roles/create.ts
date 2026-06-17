import { createRole } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { problem } from '../access/auth/responses';
import { authorizeRolePermission } from './authorize';

type CreateRoleBody = {
  name?: string;
  description?: string;
  permissionKeys?: string[];
};

export const createRoleRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    if (!(await authorizeRolePermission(req, reply, 'roles:create'))) return;

    const body = (req.body ?? {}) as CreateRoleBody;

    if (!body.name) {
      problem(reply, 400, 'Role name is required', 'role_name_required');
      return;
    }

    try {
      const role = await createRole({
        organizationId: req.organization?.organizationId as OrganizationId,
        userId: req.auth?.userId as UserId,
        name: body.name,
        description: body.description,
        permissionKeys: body.permissionKeys ?? [],
      });

      reply.status(201).send(role);
    } catch (error) {
      if (error instanceof Error && error.message === 'Role already exists') {
        problem(reply, 409, error.message, 'role_already_exists');
        return;
      }

      if (error instanceof Error && error.message === 'Invalid role name') {
        problem(reply, 400, error.message, 'invalid_role_name');
        return;
      }

      throw error;
    }
  },
);
