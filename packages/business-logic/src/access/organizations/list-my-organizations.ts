import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type Membership,
  MembershipSchemaMongo,
  type Organization,
  OrganizationSchemaMongo,
  type UserId,
  type RoleId,
} from '@hlb/contracts';

export const listMyOrganizations = async (userId: UserId) => {
  const membershipModel = getModel<Membership>(Collection.MEMBERSHIPS, MembershipSchemaMongo);
  const organizationModel = getModel<Organization>(
    Collection.ORGANIZATIONS,
    OrganizationSchemaMongo,
  );

  const memberships = await membershipModel.find({
    userId,
    status: 'active',
  });

  const organizationIds = memberships.map((membership) => membership.organizationId);

  const organizations = await organizationModel.find({
    _id: { $in: organizationIds },
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  return organizations.map((organization) => {
    const membership = memberships.find(
      (item) => String(item.organizationId) === String(organization.id),
    );

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      roleId: membership?.roleId as RoleId,
      membershipId: membership?.id,
      isDefault: membership?.isDefault ?? false,
      lastSelectedAt: membership?.lastSelectedAt ?? null,
    };
  });
};
