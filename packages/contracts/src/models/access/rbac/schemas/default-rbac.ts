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

  TENANTS: [
    'tenants:read',
    'tenants:create',
    'tenants:write',
    'tenants:delete',
    'tenants:transfer',
  ],

  COMPANIES: ['companies:read', 'companies:create', 'companies:write', 'companies:delete'],

  BRANCHES: ['branches:read', 'branches:create', 'branches:write', 'branches:delete'],

  USERS: ['users:read', 'users:create', 'users:write', 'users:delete', 'users:invite'],

  MEMBERSHIPS: [
    'memberships:read',
    'memberships:create',
    'memberships:write',
    'memberships:delete',
  ],

  ROLES: ['roles:read', 'roles:create', 'roles:write', 'roles:delete'],

  PERMISSIONS: ['permissions:read'],

  CRM: [
    'contacts:read',
    'contacts:create',
    'contacts:write',
    'contacts:delete',

    'crm_leads:read',
    'crm_leads:create',
    'crm_leads:write',
    'crm_leads:delete',

    'crm_deals:read',
    'crm_deals:create',
    'crm_deals:write',
    'crm_deals:delete',

    'crm_activities:read',
    'crm_activities:create',
    'crm_activities:write',
    'crm_activities:delete',
  ],

  SALES: [
    'quotes:read',
    'quotes:create',
    'quotes:write',
    'quotes:delete',

    'sales_orders:read',
    'sales_orders:create',
    'sales_orders:write',
    'sales_orders:delete',
  ],

  BILLING: [
    'invoices:read',
    'invoices:create',
    'invoices:write',
    'invoices:delete',

    'credit_notes:read',
    'credit_notes:create',
    'credit_notes:write',
    'credit_notes:delete',

    'debit_notes:read',
    'debit_notes:create',
    'debit_notes:write',
    'debit_notes:delete',

    'payments:read',
    'payments:create',
    'payments:write',
    'payments:delete',
  ],

  FINANCE: [
    'expenses:read',
    'expenses:create',
    'expenses:write',
    'expenses:delete',

    'revenues:read',
    'revenues:create',
    'revenues:write',
    'revenues:delete',

    'accounts_receivable:read',
    'accounts_receivable:manage',

    'accounts_payable:read',
    'accounts_payable:manage',
  ],

  TREASURY: [
    'financial_accounts:read',
    'financial_accounts:create',
    'financial_accounts:write',
    'financial_accounts:delete',

    'financial_transactions:read',
    'financial_transactions:create',
    'financial_transactions:write',

    'bank_reconciliations:read',
    'bank_reconciliations:create',
    'bank_reconciliations:write',
  ],

  INVENTORY: [
    'products:read',
    'products:create',
    'products:write',
    'products:delete',

    'warehouses:read',
    'warehouses:create',
    'warehouses:write',
    'warehouses:delete',

    'stock_movements:read',
    'stock_movements:create',

    'inventory:read',
    'inventory:write',
    'inventory:adjust',
  ],

  PURCHASING: [
    'suppliers:read',
    'suppliers:create',
    'suppliers:write',
    'suppliers:delete',

    'purchase_orders:read',
    'purchase_orders:create',
    'purchase_orders:write',
    'purchase_orders:delete',

    'supplier_bills:read',
    'supplier_bills:create',
    'supplier_bills:write',
    'supplier_bills:delete',
  ],

  ACCOUNTING: [
    'chart_of_accounts:read',
    'chart_of_accounts:write',

    'journal_entries:read',
    'journal_entries:create',
    'journal_entries:write',

    'accounting_reports:read',
    'accounting_reports:export',
  ],

  PROJECTS: [
    'projects:read',
    'projects:create',
    'projects:write',
    'projects:delete',

    'tasks:read',
    'tasks:create',
    'tasks:write',
    'tasks:delete',

    'time_entries:read',
    'time_entries:create',
    'time_entries:write',
  ],

  HR: [
    'employees:read',
    'employees:create',
    'employees:write',
    'employees:delete',

    'contracts:read',
    'contracts:create',
    'contracts:write',

    'payroll:read',
    'payroll:create',
    'payroll:write',
  ],

  SUPPORT: [
    'tickets:read',
    'tickets:create',
    'tickets:write',
    'tickets:delete',

    'knowledge_base:read',
    'knowledge_base:write',
  ],

  CALENDAR: ['calendar:read', 'calendar:create', 'calendar:write', 'calendar:delete'],

  DOCUMENTS: ['files:read', 'files:upload', 'files:delete'],

  POS: [
    'pos:read',
    'pos:write',

    'pos_devices:read',
    'pos_devices:create',
    'pos_devices:write',
    'pos_devices:delete',

    'pos_sessions:read',
    'pos_sessions:create',
    'pos_sessions:close',

    'pos_receipts:read',
    'pos_receipts:create',
    'pos_receipts:refund',

    'cash_registers:read',
    'cash_registers:create',
    'cash_registers:write',
    'cash_registers:delete',

    'cash_movements:read',
    'cash_movements:create',
    'cash_movements:write',
  ],

  ANALYTICS: ['analytics:read', 'analytics:export'],

  REPORTS: ['reports:read', 'reports:export'],

  AUTOMATIONS: [
    'automations:read',
    'automations:create',
    'automations:write',
    'automations:delete',
  ],

  INTEGRATIONS: [
    'integrations:read',
    'integrations:create',
    'integrations:write',
    'integrations:delete',
  ],

  NOTIFICATIONS: ['notifications:read', 'notifications:write'],

  SETTINGS: ['settings:read', 'settings:write'],

  NUMBER_SEQUENCES: ['number_sequences:read', 'number_sequences:write'],

  AUDIT: ['audit_logs:read'],
} as const;
