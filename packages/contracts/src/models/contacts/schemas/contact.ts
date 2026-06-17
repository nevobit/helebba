import type {
  CompanyId,
  ContactId,
  GroupId,
  PersistedSoftDeletableEntity,
  OrganizationId,
  UserId,
} from '../../../common';

export type ContactBankAccount = {
  bank?: string;
  accountNumber?: string;
  swift?: string;
  accountType?: string;
  holderName?: string;
  currency?: string;
  reference?: string;
  isDefault?: boolean;
};

export interface Contact extends PersistedSoftDeletableEntity<ContactId, UserId> {
  customId: string;
  name: string;
  code: string;
  vatnumber: string;
  tradeName: string;
  email: string;
  mobile: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  department?: string;
  country?: string;
  website?: string;
  tags?: readonly string[];
  assignedUserIds?: readonly UserId[];
  type: string;
  iban: string;
  swift: string;
  bankAccounts?: readonly ContactBankAccount[];
  groupId: GroupId;
  clientRecord: string;
  isPerson: boolean;
  companyId?: CompanyId;
  organizationId: OrganizationId;
}
