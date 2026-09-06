import type { OrganizationId, UserId } from '../..';
import type { CompanyId, PersistedSoftDeletableEntity } from '../../../common';
import type { ContactId, GroupId } from '../ids';

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

export type ContactAttachment = {
  id: string;
  name: string;
  url: string;
  contentType?: string;
  size?: number;
  createdAt: string;
  createdBy: UserId;
};

export interface Contact extends PersistedSoftDeletableEntity<ContactId> {
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
  attachments?: readonly ContactAttachment[];
  portalAccessToken?: string;
  groupId: GroupId;
  clientRecord: string;
  isPerson: boolean;
  companyId?: CompanyId;
  organizationId: OrganizationId;
}
