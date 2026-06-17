import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type Membership,
  MembershipSchemaMongo,
  type OrganizationId,
  type Role,
  type RoleId,
  RoleSchemaMongo,
  type UserId,
} from '@hlb/contracts';

export const deleteRole = async ({
  organizationId,
  roleId,
  userId,
}: {
  organizationId: OrganizationId;
  roleId: RoleId;
  userId: UserId;
}) => {
  const roleModel = getModel<Role>(Collection.ROLES, RoleSchemaMongo);
  const membershipModel = getModel<Membership>(Collection.MEMBERSHIPS, MembershipSchemaMongo);
  const role = await roleModel.findOne({
    _id: roleId,
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!role) {
    throw new Error('Role not found');
  }

  if (role.isSystem) {
    throw new Error('System roles cannot be deleted');
  }

  const assignedMemberships = await membershipModel.countDocuments({
    organizationId,
    roleId,
    status: { $in: ['active', 'pending', 'invited'] },
  });

  if (assignedMemberships > 0) {
    throw new Error('Role is assigned to members');
  }

  role.set({
    lifecycleStatus: LifecycleStatus.DELETED,
    deletedAt: new Date(),
    deletedBy: userId,
    updatedBy: userId,
  });

  await role.save();

  return { id: roleId };
};
