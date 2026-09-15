import type { OrganizationId, PersistedSoftDeletableEntity, UserId } from '../../../../common';

export interface OrganizationNavigationPreference {
  itemId: string;
  isVisible: boolean;
  position?: number;
  name?: string;
  icon?: string;
}

export interface Organization extends PersistedSoftDeletableEntity<OrganizationId, UserId> {
  name: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  timezone: string;
  logoUrl: string;
  type: string;
  size: string;
  structure: string;
  website: string;
  billingAddress?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingProvince?: string;
  billingCountry?: string;
  numericFormat?: string;
  decimals?: number;
  language?: string;
  dateFormat?: string;
  brandColor?: string;
  isPrincipal: boolean;
  slug: string;
  ownerId: UserId;
  navigationPreferences?: OrganizationNavigationPreference[];
}
