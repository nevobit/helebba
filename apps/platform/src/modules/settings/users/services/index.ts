import { api } from '@/shared/api';
import type { Role, RoleId, UserId } from '@hlb/contracts';

export type OrganizationUserListItem = {
  userId: UserId;
  membershipId: string;
  roleId: RoleId;
  roleName: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'invited' | 'declined' | 'removed';
  lastSelectedAt?: string;
};

export type OrganizationUsersResponse = {
  items: OrganizationUserListItem[];
};

export type RolesResponse = {
  items: Role[];
};

export type CreateRolePayload = {
  name: string;
  description?: string;
  permissionKeys: string[];
};

export type InviteUserPayload = {
  email: string;
  isAdvisor?: boolean;
  roleId: RoleId;
};

export const organizationUsers = async () => {
  const { data } = await api.get<OrganizationUsersResponse>('/me/users');

  return data;
};

export const roles = async () => {
  const { data } = await api.get<RolesResponse>('/roles');

  return data;
};

export const createRole = async (payload: CreateRolePayload) => {
  const { data } = await api.post<Role>('/roles', payload);

  return data;
};

export const inviteUser = async (payload: InviteUserPayload) => {
  const { data } = await api.post('/me/users/invite', payload);

  return data;
};

export const resendInvitation = async (membershipId: string) => {
  const { data } = await api.post(`/me/users/invitations/${membershipId}/resend`);

  return data;
};

export const revokeInvitation = async (membershipId: string) => {
  const { data } = await api.delete(`/me/users/invitations/${membershipId}`);

  return data;
};
