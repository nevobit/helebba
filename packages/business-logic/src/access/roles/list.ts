import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, type OrganizationId, type Role, RoleSchemaMongo } from '@hlb/contracts';

export const listRoles = async (organizationId: OrganizationId): Promise<Role[]> => {
  const model = getModel<Role>(Collection.ROLES, RoleSchemaMongo);

  return await model
    .find({
      organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    })
    .sort({ isSystem: -1, name: 1 });
};
