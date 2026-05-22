import type { AuthorizationSubject } from '@keystone/contracts';

export interface PermissionCheckInput {
  readonly subject: AuthorizationSubject;
  readonly resource: string;
  readonly action: string;
  readonly ownerId?: string;
  readonly currentUserId?: string;
}

export const buildPermissionKey = (resource: string, action: string): string => {
  return `${resource}:${action}`;
};

const normalize = (value: string): string => value.trim().toLowerCase();

const matchesPermission = (
  granted: string,
  requiredResource: string,
  requiredAction: string,
): boolean => {
  const [resource = '', action = ''] = granted.split(':');
  const grantedResource = normalize(resource);
  const grantedAction = normalize(action);

  const targetResource = normalize(requiredResource);
  const targetAction = normalize(requiredAction);

  const resourceMatch = grantedResource === '*' || grantedResource === targetResource;

  const actionMatch = grantedAction === '*' || grantedAction === targetAction;

  return resourceMatch && actionMatch;
};

export const hasPermission = (input: PermissionCheckInput): boolean => {
  const permissions = new Set(input.subject.permissionKeys.map((item: string) => normalize(item)));

  const exact = buildPermissionKey(input.resource, input.action);
  const own = buildPermissionKey(input.resource, 'own');

  if ([...permissions].some((value) => matchesPermission(value, input.resource, input.action))) {
    return true;
  }

  if (
    input.ownerId &&
    input.currentUserId &&
    input.ownerId === input.currentUserId &&
    [...permissions].some((value) => matchesPermission(value, input.resource, 'own'))
  ) {
    return true;
  }

  return permissions.has(normalize(exact)) || permissions.has(normalize(own));
};

export const hasAnyPermission = (
  subject: AuthorizationSubject,
  required: readonly string[],
): boolean => {
  const permissions = new Set(subject.permissionKeys.map((item) => normalize(item)));

  return required.some((item) => permissions.has(normalize(item)));
};

export const hasAllPermissions = (
  subject: AuthorizationSubject,
  required: readonly string[],
): boolean => {
  const permissions = new Set(subject.permissionKeys.map((item) => normalize(item)));

  return required.every((item) => permissions.has(normalize(item)));
};

export const mergePermissionKeys = (
  rolePermissionKeys: readonly string[],
  membershipPermissionKeys: readonly string[],
): readonly string[] => {
  return [...new Set([...rolePermissionKeys, ...membershipPermissionKeys])];
};
