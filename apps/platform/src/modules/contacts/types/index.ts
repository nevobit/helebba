export type ContactKind = string;

export type ContactRow = {
  id: string;
  code: string;
  initials: string;
  createdAt: string;
  name: string;
  tradeName: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  postalCode: string;
  department: string;
  country: string;
  countryCode: string;
  language: string;
  website: string;
  tags: string;
  kind: ContactKind;
  isPerson: boolean;
  companyId: string;
  portalVisibility: string;
};
