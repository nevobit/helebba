import type {
  PersistedEntity,
  UserId,
  OrganizationId,
  ISODateTimeString,
  Brand,
} from '../../../../common';

export type RoleId = Brand<string, 'RoleId'>;
export type PermissionId = Brand<string, 'PermissionId'>;
export type MembershipId = Brand<string, 'MembershipId'>;
export type SessionId = Brand<string, 'SessionId'>;

export type ResourceScope = 'platform' | 'tenant' | 'workspace' | 'own';
export type PermissionEffect = 'allow' | 'deny';

export interface Permission extends PersistedEntity<PermissionId, UserId> {
  readonly key: string;
  readonly resource: string;
  readonly action: string;
  readonly scope: ResourceScope;
  readonly effect: PermissionEffect;
  readonly description?: string;
}

export interface Role extends PersistedEntity<RoleId, UserId> {
  readonly name: string;
  readonly code: string;
  readonly organizationId: OrganizationId;
  readonly description?: string;
  readonly permissionKeys: readonly string[];
  readonly isSystem: boolean;
}

export interface AuthorizationSubject {
  readonly userId: UserId;
  readonly organizationId?: OrganizationId;
  readonly roleCodes: readonly string[];
  readonly permissionKeys: readonly string[];
}
