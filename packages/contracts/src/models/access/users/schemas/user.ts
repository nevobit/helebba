import type { ISODateTimeString, PersistedSoftDeletableEntity, UserId } from '../../../../common';

interface GoogleProvider {
  sub: string;
  email: string;
}
interface AppleProvider {
  sub: string;
  email: string;
}
export interface Provider {
  email: string;
  google: GoogleProvider;
  apple: AppleProvider;
  facebook: string;
}
export interface User extends PersistedSoftDeletableEntity<UserId> {
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
