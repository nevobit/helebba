import type {
  GroupId,
  ISODateTimeString,
  PersistedSoftDeletableEntity,
  ProductId,
} from '../../../../common';

interface GoogleProvider {
  sub: string;
  email: string;
}
export interface Provider {
  email: string;
  google: GoogleProvider;
  apple: string;
  facebook: string;
}
export interface User extends PersistedSoftDeletableEntity<ProductId> {
  name: string;
  phone: string;
  newsletter: boolean;
  photo: string;
  provider: Provider;
  username: string;
  lastLogin: ISODateTimeString;
  loginAttempts: number;
  twoFactorAuth: boolean;
  locked: boolean;
  identification: string;
  email: string;
}
