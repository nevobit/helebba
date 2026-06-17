import { Collection, getMailer, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type ISODateTimeString,
  type Membership,
  MembershipSchemaMongo,
  type MembershipId,
  type Organization,
  OrganizationSchemaMongo,
  type OrganizationId,
  type Role,
  type RoleId,
  RoleSchemaMongo,
  type User,
  UserSchemaMongo,
  type UserId,
} from '@hlb/contracts';

export type InviteOrganizationUserInput = {
  email: string;
  invitedBy: UserId;
  isAdvisor?: boolean;
  organizationId: OrganizationId;
  roleId: RoleId;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getAppUrl = () =>
  (
    process.env.PUBLIC_APP_URL ??
    process.env.WEB_APP_URL ??
    process.env.FRONTEND_URL ??
    process.env.APP_URL ??
    'http://localhost:5174'
  ).replace(/\/$/, '');

const getInvitationUrl = (membershipId: string) =>
  `${getAppUrl()}/accounts?invitation=${encodeURIComponent(membershipId)}`;

const sendOrganizationInvitationEmail = async ({
  invitedEmail,
  invitedBy,
  membershipId,
  organizationId,
}: {
  invitedEmail: string;
  invitedBy: UserId;
  membershipId: MembershipId | string;
  organizationId: OrganizationId;
}) => {
  const organizationModel = getModel<Organization>(
    Collection.ORGANIZATIONS,
    OrganizationSchemaMongo,
  );
  const userModel = getModel<User>(Collection.USERS, UserSchemaMongo);
  const [organization, inviter] = await Promise.all([
    organizationModel.findOne({ _id: organizationId, lifecycleStatus: LifecycleStatus.ACTIVE }),
    userModel.findOne({ _id: invitedBy }),
  ]);
  const organizationName = organization?.legalName || organization?.name || 'tu organización';
  const inviterName = inviter?.name || inviter?.email || 'Un miembro de tu equipo';
  const mailer = getMailer();

  await mailer.sendTemplate({
    to: invitedEmail,
    template: {
      name: 'invitation',
      props: {
        inviteUrl: getInvitationUrl(String(membershipId)),
        inviterName,
        organizationName,
      },
    },
  });
};

export const inviteOrganizationUser = async ({
  email,
  invitedBy,
  isAdvisor = false,
  organizationId,
  roleId,
}: InviteOrganizationUserInput): Promise<Membership> => {
  const invitedEmail = normalizeEmail(email);

  if (!invitedEmail || !invitedEmail.includes('@')) {
    throw new Error('Invalid email');
  }

  const membershipModel = getModel<Membership>(Collection.MEMBERSHIPS, MembershipSchemaMongo);
  const roleModel = getModel<Role>(Collection.ROLES, RoleSchemaMongo);
  const userModel = getModel<User>(Collection.USERS, UserSchemaMongo);

  const role = await roleModel.findOne({
    _id: roleId,
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!role) {
    throw new Error('Role not found');
  }

  const existingMembership = await membershipModel.findOne({
    organizationId,
    invitedEmail,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    status: { $in: ['active', 'pending', 'invited'] },
  });

  if (existingMembership) {
    throw new Error('Membership already exists');
  }

  const existingUser = await userModel.findOne({ email: invitedEmail });
  const now = new Date();
  const nowIso = now.toISOString() as ISODateTimeString;

  void isAdvisor;

  const membership = await membershipModel.create({
    organizationId,
    userId: (existingUser?.id ?? `invited:${invitedEmail}`) as UserId,
    invitedEmail,
    roleIds: [role.id],
    roleId: role.id,
    permissionKeys: role.permissionKeys,
    title: role.name,
    joinedAt: nowIso,
    status: 'invited',
    profile: {
      displayName: invitedEmail,
    },
    preferences: {
      notifications: {
        email: true,
        inApp: true,
      },
    },
    invitedBy,
    invitedAt: now as unknown as ISODateTimeString,
    isDefault: false,
    lastSelectedAt: nowIso,
    createdBy: invitedBy,
    updatedBy: invitedBy,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  await sendOrganizationInvitationEmail({
    invitedEmail,
    invitedBy,
    membershipId: membership.id,
    organizationId,
  });

  return membership;
};

export const resendOrganizationInvitation = async ({
  membershipId,
  organizationId,
  userId,
}: {
  membershipId: MembershipId;
  organizationId: OrganizationId;
  userId: UserId;
}): Promise<Membership> => {
  const membershipModel = getModel<Membership>(Collection.MEMBERSHIPS, MembershipSchemaMongo);
  const membership = await membershipModel.findOne({
    _id: membershipId,
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    status: { $in: ['pending', 'invited'] },
  });

  if (!membership) {
    throw new Error('Invitation not found');
  }

  const now = new Date();
  membership.set({
    invitedAt: now as unknown as ISODateTimeString,
    updatedBy: userId,
  });
  await membership.save();

  await sendOrganizationInvitationEmail({
    invitedEmail: membership.invitedEmail,
    invitedBy: userId,
    membershipId: membership.id,
    organizationId,
  });

  return membership;
};

export const revokeOrganizationInvitation = async ({
  membershipId,
  organizationId,
  userId,
}: {
  membershipId: MembershipId;
  organizationId: OrganizationId;
  userId: UserId;
}): Promise<{ id: MembershipId }> => {
  const membershipModel = getModel<Membership>(Collection.MEMBERSHIPS, MembershipSchemaMongo);
  const membership = await membershipModel.findOne({
    _id: membershipId,
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    status: { $in: ['pending', 'invited'] },
  });

  if (!membership) {
    throw new Error('Invitation not found');
  }

  membership.set({
    status: 'removed',
    updatedBy: userId,
  });
  await membership.save();

  return { id: membership.id };
};
