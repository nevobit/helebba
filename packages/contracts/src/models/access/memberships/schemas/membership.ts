import type { ISODateTimeString, PersistedEntity, UserId } from '../../../../common';
import type { MembershipId, RoleId } from '../../rbac';

export interface Preferences {
  notifications: {
    email: boolean;
    inApp: boolean;
  };
}

export interface Profile {
  displayName?: string;
  signature?: string;
  avatar?: string;
  locale?: string;
}

export interface Membership extends PersistedEntity<MembershipId, UserId> {
  userId: UserId;
  invitedEmail: string;
  roleIds: readonly RoleId[];
  roleId: RoleId;
  permissionKeys: readonly string[];
  title?: string;
  joinedAt: ISODateTimeString;
  profile?: Profile;
  preferences?: Preferences;
  invitedBy?: UserId;
  invitedAt?: ISODateTimeString;
  isDefault?: boolean;
  lastSelectedAt?: ISODateTimeString;
  status: 'active' | 'pending' | 'invited' | 'declined' | 'removed';
}
