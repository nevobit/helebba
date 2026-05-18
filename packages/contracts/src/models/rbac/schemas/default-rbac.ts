export const SYSTEM_ROLE_CODES = {
  PLATFORM_OWNER: 'platform_owner',

  TENANT_OWNER: 'tenant_owner',
  TENANT_ADMIN: 'tenant_admin',

  WORKSPACE_ADMIN: 'workspace_admin',
  WORKSPACE_MANAGER: 'workspace_manager',
  WORKSPACE_ACCOUNTANT: 'workspace_accountant',
  WORKSPACE_SALES: 'workspace_sales',
  WORKSPACE_SUPPORT: 'workspace_support',
  WORKSPACE_OPERATOR: 'workspace_operator',

  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export const SYSTEM_PERMISSIONS = {
  PLATFORM_READ: 'platform:read',
  PLATFORM_WRITE: 'platform:write',
  PLATFORM_SETTINGS: 'platform:settings',

  TENANTS_READ: 'tenants:read',
  TENANTS_CREATE: 'tenants:create',
  TENANTS_WRITE: 'tenants:write',
  TENANTS_DELETE: 'tenants:delete',
  TENANTS_TRANSFER: 'tenants:transfer',

  COMPANIES_READ: 'companies:read',
  COMPANIES_CREATE: 'companies:create',
  COMPANIES_WRITE: 'companies:write',
  COMPANIES_DELETE: 'companies:delete',

  BRANCHES_READ: 'branches:read',
  BRANCHES_CREATE: 'branches:create',
  BRANCHES_WRITE: 'branches:write',
  BRANCHES_DELETE: 'branches:delete',

  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  USERS_INVITE: 'users:invite',

  MEMBERSHIPS_READ: 'memberships:read',
  MEMBERSHIPS_CREATE: 'memberships:create',
  MEMBERSHIPS_WRITE: 'memberships:write',
  MEMBERSHIPS_DELETE: 'memberships:delete',

  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_WRITE: 'roles:write',
  ROLES_DELETE: 'roles:delete',

  PERMISSIONS_READ: 'permissions:read',

  POS_READ: 'pos:read',
  POS_WRITE: 'pos:write',

  POS_DEVICES_READ: 'pos_devices:read',
  POS_DEVICES_CREATE: 'pos_devices:create',
  POS_DEVICES_WRITE: 'pos_devices:write',
  POS_DEVICES_DELETE: 'pos_devices:delete',

  POS_SESSIONS_READ: 'pos_sessions:read',
  POS_SESSIONS_CREATE: 'pos_sessions:create',
  POS_SESSIONS_CLOSE: 'pos_sessions:close',

  POS_RECEIPTS_READ: 'pos_receipts:read',
  POS_RECEIPTS_CREATE: 'pos_receipts:create',
  POS_RECEIPTS_REFUND: 'pos_receipts:refund',

  CASH_REGISTERS_READ: 'cash_registers:read',
  CASH_REGISTERS_CREATE: 'cash_registers:create',
  CASH_REGISTERS_WRITE: 'cash_registers:write',
  CASH_REGISTERS_DELETE: 'cash_registers:delete',

  CASH_MOVEMENTS_READ: 'cash_movements:read',
  CASH_MOVEMENTS_CREATE: 'cash_movements:create',
  CASH_MOVEMENTS_WRITE: 'cash_movements:write',

  AUDIT_LOGS_READ: 'audit_logs:read',

  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_WRITE: 'notifications:write',

  FILES_READ: 'files:read',
  FILES_UPLOAD: 'files:upload',
  FILES_DELETE: 'files:delete',

  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',

  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',

  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',

  NUMBER_SEQUENCES_READ: 'number_sequences:read',
  NUMBER_SEQUENCES_WRITE: 'number_sequences:write',
} as const;

export const PERMISSION_GROUPS = {
  PLATFORM: ['platform:read', 'platform:write', 'platform:settings'],

  IAM: [
    'users:read',
    'users:create',
    'users:write',
    'users:delete',
    'roles:read',
    'roles:create',
    'roles:write',
    'roles:delete',
  ],

  CRM: [
    'contacts:read',
    'contacts:create',
    'contacts:write',
    'crm_deals:read',
    'crm_deals:create',
    'crm_deals:write',
  ],

  INVENTORY: ['inventory:read', 'inventory:write', 'inventory:adjust'],

  BILLING: ['invoices:read', 'invoices:create', 'payments:read', 'payments:create'],

  POS: ['pos:read', 'pos:write'],

  ANALYTICS: ['analytics:read', 'analytics:export'],
} as const;
