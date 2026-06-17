import { api } from '@/shared/api';
import type { MembershipId, Organization, OrganizationId, RoleId } from '@hlb/contracts';

export type AccountListItem = {
  id: OrganizationId;
  name: string;
  slug: string;
  roleId?: RoleId;
  membershipId?: MembershipId;
  isDefault: boolean;
  lastSelectedAt: string | null;
};

export type OrganizationsResponse = {
  items: AccountListItem[];
};

export type LoginOrganizationResponse = {
  accessToken: string;
  refreshToken: string;
  organization: Organization;
  membershipId: MembershipId;
  roleId: RoleId;
};

export const organizations = async () => {
  const { data } = await api.get<OrganizationsResponse>('/me/organizations');
  return data;
};

export const loginOrganization = async (organizationId: OrganizationId) => {
  const { data } = await api.post<LoginOrganizationResponse>('/auth/session/organization', {
    organizationId,
  });
  return data;
};
