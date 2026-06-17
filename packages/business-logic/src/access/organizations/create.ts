import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type Membership,
  type MembershipId,
  MembershipSchemaMongo,
  type Organization,
  type OrganizationId,
  OrganizationSchemaMongo,
  type User,
  UserSchemaMongo,
  type UserId,
  type ISODateTimeString,
} from '@hlb/contracts';
import { getOwnerRole, seedDefaultRoles } from '../roles';
import { createOrganizationSubscription } from '../subscriptions';
import { createWarehouse } from '../../warehouses';
import { seedDefaultPaymentMethods } from '../../payment-methods';

export type CreateOrganizationInput = {
  userId: UserId;
  organization: Pick<Organization, 'legalName' | 'type' | 'size' | 'country' | 'structure'> &
    Partial<Pick<Organization, 'website'>>;
};

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

const buildSlug = async (name: string) => {
  const model = getModel<Organization>(Collection.ORGANIZATIONS, OrganizationSchemaMongo);
  const baseSlug = slugify(name) || `account-${Date.now()}`;
  const existing = await model.countDocuments({ slug: baseSlug });

  if (!existing) return baseSlug;

  return `${baseSlug}-${existing + 1}`;
};

export const createOrganization = async ({ organization, userId }: CreateOrganizationInput) => {
  const organizationModel = getModel<Organization>(
    Collection.ORGANIZATIONS,
    OrganizationSchemaMongo,
  );
  const membershipModel = getModel<Membership>(Collection.MEMBERSHIPS, MembershipSchemaMongo);
  const userModel = getModel<User>(Collection.USERS, UserSchemaMongo);
  const user = await userModel.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const activeOrganizations = await organizationModel.countDocuments({
    ownerId: userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
  const slug = await buildSlug(organization.legalName);

  const createdOrganization = await organizationModel.create({
    ...organization,
    name: organization.legalName,
    email: user.email,
    currency: organization.country === 'CO' ? 'COP' : 'USD',
    timezone: organization.country === 'CO' ? 'America/Bogota' : 'UTC',
    isPrincipal: activeOrganizations === 0,
    slug,
    ownerId: userId,
    createdBy: userId,
    updatedBy: userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  });

  const organizationId = createdOrganization.id as OrganizationId;
  await createWarehouse({
    organizationId,
    userId,
    name: `${organization.legalName} Almacén`,
    email: user.email,
    mobile: '',
    phone: '',
    address: {
      address: '',
      city: '',
      postalCode: 0,
      province: '',
      country: organization.country === 'CO' ? 'Colombia' : organization.country,
      countryCode: organization.country,
    },
    postalCode: '',
    color: '#c90edb',
    icon: 'warehouse',
    isDefault: true,
    accountingAccount: '',
    productsCount: 0,
    totalStock: 0,
    createdBy: userId,
    updatedBy: userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  });
  await seedDefaultPaymentMethods({ organizationId, userId });

  await seedDefaultRoles({ createdBy: userId, organizationId });
  const ownerRole = await getOwnerRole(organizationId);
  const membership = await membershipModel.create({
    organizationId,
    userId,
    invitedEmail: user.email,
    roleIds: [ownerRole.id],
    roleId: ownerRole.id,
    permissionKeys: ownerRole.permissionKeys,
    title: 'Propietario',
    joinedAt: new Date().toISOString() as ISODateTimeString,
    status: 'active',
    profile: {
      displayName: user.name ?? user.email,
    },
    preferences: {
      notifications: {
        email: true,
        inApp: true,
      },
    },
    isDefault: activeOrganizations === 0,
    lastSelectedAt: new Date().toISOString() as ISODateTimeString,
    createdBy: userId,
    updatedBy: userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
  const subscription = await createOrganizationSubscription({
    organizationId,
    planCode: 'plus',
    interval: 'monthly',
    trialDays: 7,
    userId,
  });

  return {
    organization: createdOrganization,
    membershipId: membership.id as MembershipId,
    roleId: ownerRole.id,
    subscription,
  };
};
