import crypto from 'crypto';
import { issueTokens } from './tokens';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
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
  console.log('Switching organization with input:', input);
  const model = getModel<Organization>(Collection.ORGANIZATIONS, OrganizationSchemaMongo);
  const organization = await model.findOne({
    ownerId: input.userId,
    _id: input.organizationId,
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;

  const { accessToken, refreshToken } = await issueTokens({
    kind: 'organization',
    userId: input.userId,
    organizationId: input.organizationId,
    sessionId,
  });

  return {
    accessToken,
    refreshToken,
    organization,
  };
};
