import { api } from '@/shared/api';
import type { MembershipId, Organization, RoleId, Subscription } from '@hlb/contracts';

export type CreateOrganizationInput = Pick<
  Organization,
  'legalName' | 'type' | 'size' | 'country' | 'structure'
> &
  Partial<Pick<Organization, 'website'>>;

export type CreateOrganizationResponse = {
  organization: Organization;
  subscription: Subscription;
  membershipId: MembershipId;
  roleId: RoleId;
  accessToken: string;
  refreshToken: string;
};

export const createOrganization = async (input: CreateOrganizationInput) => {
  const { data } = await api.post<CreateOrganizationResponse>('/me/organizations', input);

  return data;
};
