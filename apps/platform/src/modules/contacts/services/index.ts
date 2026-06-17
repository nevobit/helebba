import { api } from '@/shared/api';
import type { Contact, OffsetPaginatedResult, Params, UserId } from '@hlb/contracts';

export type ContactScope = 'all' | 'companies' | 'people';

export type ContactListParams = Params<{
  scope?: ContactScope;
}>;

export type CreateContactPayload = Partial<
  Pick<
    Contact,
    | 'address'
    | 'city'
    | 'country'
    | 'code'
    | 'department'
    | 'email'
    | 'isPerson'
    | 'companyId'
    | 'mobile'
    | 'name'
    | 'phone'
    | 'postalCode'
    | 'tags'
    | 'tradeName'
    | 'type'
    | 'website'
    | 'assignedUserIds'
    | 'bankAccounts'
    | 'iban'
    | 'swift'
  >
>;

export type UpdateContactPayload = CreateContactPayload;

export type OrganizationUserListItem = {
  userId: UserId;
  membershipId: string;
  roleId: string;
  name: string;
  email: string;
};

export type OrganizationUsersResponse = {
  items: OrganizationUserListItem[];
};

export const contacts = async (params: ContactListParams) => {
  const { data } = await api.get<OffsetPaginatedResult<Contact>>('/contacts', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim() || undefined,
      scope: params.scope ?? 'all',
    },
  });

  return data;
};

export const createContact = async (payload: CreateContactPayload) => {
  const { data } = await api.post<Contact>('/contacts', payload);

  return data;
};

export const updateContact = async (contactId: string, payload: UpdateContactPayload) => {
  const { data } = await api.patch<Contact>(`/contacts/${contactId}`, payload);

  return data;
};

export const deleteContact = async (contactId: string) => {
  const { data } = await api.delete<boolean>(`/contacts/${contactId}`);

  return data;
};

export const companyContacts = async () => {
  const { data } = await api.get<OffsetPaginatedResult<Contact>>('/contacts', {
    params: {
      page: 1,
      limit: 100,
      scope: 'companies',
    },
  });

  return data;
};

export const organizationUsers = async () => {
  const { data } = await api.get<OrganizationUsersResponse>('/me/users');

  return data;
};
