import crypto from 'crypto';
import { issueTokens } from './tokens';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type Membership,
  MembershipSchemaMongo,
  type Organization,
  OrganizationSchemaMongo,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

type LoginInput = {
  userId: UserId;
  organizationId: OrganizationId;
};
export const loginOrganization = async (input: LoginInput) => {
  const organizationModel = getModel<Organization>(
    Collection.ORGANIZATIONS,
    OrganizationSchemaMongo,
  );
  const membershipModel = getModel<Membership>(Collection.MEMBERSHIPS, MembershipSchemaMongo);
  const membership = await membershipModel.findOne({
    organizationId: input.organizationId,
    userId: input.userId,
    status: 'active',
  });

  if (!membership) {
    throw new Error('Membership not found');
  }

  const organization = await organizationModel.findOne({
    _id: input.organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;

  const { accessToken, refreshToken } = await issueTokens({
    kind: 'organization',
    userId: input.userId,
    organizationId: input.organizationId,
    membershipId: membership.id,
    roleId: membership.roleId,
    sessionId,
  });

  return {
    accessToken,
    refreshToken,
    organization,
    membershipId: membership.id,
    roleId: membership.roleId,
  };
};
