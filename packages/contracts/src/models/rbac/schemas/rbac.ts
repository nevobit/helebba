import type {
  PersistedEntity,
  UserId,
  WorkspaceId,
  TenantId,
  ISODateTimeString,
  Brand,
} from '../../../common';

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
  readonly tenantId: TenantId;
  readonly workspaceId?: WorkspaceId;
  readonly description?: string;
  readonly permissionKeys: readonly string[];
  readonly isSystem: boolean;
}

export interface Membership extends PersistedEntity<MembershipId, UserId> {
  readonly tenantId: TenantId;
  readonly workspaceId?: WorkspaceId;
  readonly userId: UserId;
  readonly roleIds: readonly RoleId[];
  readonly permissionKeys: readonly string[];
  readonly title?: string;
  readonly joinedAt: ISODateTimeString;
}

export interface AuthorizationSubject {
  readonly userId: UserId;
  readonly tenantId?: TenantId;
  readonly workspaceId?: WorkspaceId;
  readonly roleCodes: readonly string[];
  readonly permissionKeys: readonly string[];
}
