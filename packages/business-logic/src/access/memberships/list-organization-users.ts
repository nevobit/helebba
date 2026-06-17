import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type Membership,
  MembershipSchemaMongo,
  type MembershipId,
  type OrganizationId,
  type Role,
  type RoleId,
  RoleSchemaMongo,
  type UserId,
} from '@hlb/contracts';

export type OrganizationUserListItem = {
  userId: UserId;
  membershipId: MembershipId;
  roleId: RoleId;
  roleName: string;
  name: string;
  email: string;
  status: Membership['status'];
  lastSelectedAt?: string;
};

export const listOrganizationUsers = async (
  organizationId: OrganizationId,
): Promise<OrganizationUserListItem[]> => {
  const membershipModel = getModel<Membership>(Collection.MEMBERSHIPS, MembershipSchemaMongo);
  const roleModel = getModel<Role>(Collection.ROLES, RoleSchemaMongo);
  const memberships = await membershipModel
    .find({
      organizationId,
      status: { $in: ['active', 'invited', 'pending'] },
      lifecycleStatus: LifecycleStatus.ACTIVE,
    })
    .sort({ 'profile.displayName': 1, invitedEmail: 1 });
  const roleIds = [...new Set(memberships.map((membership) => String(membership.roleId)))];
  const roles = await roleModel.find({
    _id: { $in: roleIds },
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
  const rolesById = new Map(roles.map((role) => [String(role.id), role]));

  return memberships.map((membership) => ({
    userId: membership.userId,
    membershipId: membership.id,
    roleId: membership.roleId,
    roleName: rolesById.get(String(membership.roleId))?.name ?? membership.title ?? 'Usuario',
    name: membership.profile?.displayName || membership.invitedEmail,
    email: membership.invitedEmail,
    status: membership.status,
    lastSelectedAt: membership.lastSelectedAt,
  }));
};
