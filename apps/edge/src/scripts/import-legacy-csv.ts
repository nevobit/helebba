import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { seedDefaultPaymentMethods, seedDefaultRoles } from '@hlb/business-logic';
import { Collection, getModel, setLogger } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  DocumentType,
  LifecycleStatus,
  MembershipSchemaMongo,
  OrganizationSchemaMongo,
  PaymentMethodSchemaMongo,
  PaymentSchemaMongo,
  RoleSchemaMongo,
  StatusDocument,
  SubscriptionSchemaMongo,
  SYSTEM_ROLE_CODES,
  UserSchemaMongo,
  createPlanSnapshot,
  type Document,
  type Membership,
  type Organization,
  type OrganizationId,
  type Payment,
  type PaymentMethod,
  type PlanCode,
  type Role,
  type Subscription,
  type User,
  type UserId,
} from '@hlb/contracts';
import { initDataSources } from '@hlb/data-sources';
import { ConsoleTransport, Logger, LoggerTransportName, MonoContext } from '@hlb/kernel';

const DEFAULT_USERS_PATH = '/Users/nestor/Documents/backup/helebba_pre.users.csv';
const DEFAULT_ACCOUNTS_PATH = '/Users/nestor/Documents/backup/helebba_pre.accounts.csv';
const DEFAULT_DOCUMENTS_PATH = '/Users/nestor/Documents/backup/helebba_pre.documents.csv';
const EDGE_ENV_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
const LEGACY_PAYMENT_METHOD_LABELS: Record<string, string> = {
  addi: 'Addi',
  sistecredito: 'SisteCredito',
  bank: 'Transferencia bancaria',
  cash: 'Efectivo',
};

loadDotenv({ quiet: true });
loadDotenv({ path: EDGE_ENV_PATH, quiet: true });

type CsvRow = Record<string, string>;

type ImportOptions = {
  usersPath: string;
  accountsPath: string;
  documentsPath: string;
  write: boolean;
  parseOnly: boolean;
};

type Counters = {
  users: number;
  organizations: number;
  memberships: number;
  roles: number;
  subscriptions: number;
  paymentMethods: number;
  documents: number;
  payments: number;
  warnings: string[];
};

const usage = `
Importa datos legacy de Helebba desde CSV.

Por defecto corre en dry-run. Usa --write para escribir en MongoDB.

Uso:
  pnpm --filter edge run legacy:import -- --write

Opciones:
  --users <path>      CSV de usuarios. Default: ${DEFAULT_USERS_PATH}
  --accounts <path>   CSV de cuentas/organizaciones. Default: ${DEFAULT_ACCOUNTS_PATH}
  --documents <path>  CSV de documentos. Default: ${DEFAULT_DOCUMENTS_PATH}
  --write             Ejecuta escrituras. Sin esto solo valida y muestra conteos.
  --parse-only        Solo parsea CSV y muestra conteos, sin conectar a MongoDB.
  --help              Muestra esta ayuda.
`;

const consoleOptions = {
  transport: LoggerTransportName.CONSOLE,
  options: { destination: LoggerTransportName.CONSOLE, channelName: LoggerTransportName.CONSOLE },
};

const createLogger = () =>
  new Logger({
    optionsByLevel: {
      debug: [consoleOptions],
      info: [consoleOptions],
      warn: [consoleOptions],
      error: [consoleOptions],
      fatal: [consoleOptions],
      all: [consoleOptions],
      raw: [consoleOptions],
    },
    transports: {
      [LoggerTransportName.CONSOLE]: ConsoleTransport,
    },
    appIdentifiers: {
      region: process.env.REGION,
      hostname: os.hostname(),
      app: 'legacy-import',
      version: '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
      developer: os.userInfo().username,
    },
    catchTransportErrors: true,
    logLevel: 'all',
  });

const parseArgs = (argv: string[]): ImportOptions => {
  const options: ImportOptions = {
    usersPath: DEFAULT_USERS_PATH,
    accountsPath: DEFAULT_ACCOUNTS_PATH,
    documentsPath: DEFAULT_DOCUMENTS_PATH,
    write: false,
    parseOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      console.info(usage.trim());
      process.exit(0);
    }

    if (arg === '--') {
      continue;
    }

    if (arg === '--write') {
      options.write = true;
      continue;
    }

    if (arg === '--parse-only') {
      options.parseOnly = true;
      continue;
    }

    if (arg === '--users') {
      options.usersPath = requireNextValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--accounts') {
      options.accountsPath = requireNextValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--documents') {
      options.documentsPath = requireNextValue(argv, index, arg);
      index += 1;
      continue;
    }

    throw new Error(`Opcion no reconocida: ${arg}`);
  }

  return options;
};

const requireNextValue = (argv: string[], index: number, flag: string) => {
  const value = argv[index + 1];

  if (!value || value.startsWith('--')) {
    throw new Error(`Falta el valor para ${flag}`);
  }

  return value;
};

const parseCsv = (content: string): CsvRow[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === ',' && !quoted) {
      row.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(value);
      value = '';
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    value += char;
  }

  row.push(value);
  if (row.some((cell) => cell.length > 0)) rows.push(row);

  const [headers = [], ...dataRows] = rows;

  return dataRows.map((dataRow) =>
    headers.reduce<CsvRow>((record, header, index) => {
      record[header] = dataRow[index] ?? '';
      return record;
    }, {}),
  );
};

const readCsv = async (filePath: string) => {
  const content = await fs.readFile(path.resolve(filePath), 'utf8');

  return parseCsv(content);
};

const numberValue = (value: unknown, fallback = 0) => {
  const normalized = String(value ?? '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const boolValue = (value: unknown) => {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  return ['true', '1', 'yes', 'si', 'sí'].includes(normalized);
};

const isoDate = (value: unknown, fallback = new Date()) => {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback.toISOString();

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? fallback.toISOString() : parsed.toISOString();
};

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

const normalizePlan = (value: unknown): PlanCode => {
  const plan = String(value ?? '')
    .trim()
    .toLowerCase();
  const accepted = ['plus', 'basic', 'standard', 'advanced', 'premium', 'accounting'];

  return (accepted.includes(plan) ? plan : 'plus') as PlanCode;
};

const normalizeDocumentType = (value: unknown) => {
  const docType = String(value ?? '').trim();

  if (docType === DocumentType.EXPENSES) return DocumentType.PURCHASE;
  if (docType === 'quote') return DocumentType.ESTIMATE;

  return docType || DocumentType.INVOICE;
};

const documentDirection = (docType: string) =>
  [DocumentType.PURCHASE, DocumentType.PURCHASE_ORDER, DocumentType.PURCHASE_REFUND].includes(
    docType as DocumentType,
  )
    ? 'outflow'
    : 'inflow';

const getEntityId = (entity: { id?: unknown; _id?: unknown }) => String(entity.id ?? entity._id);

const normalizeLegacyPaymentMethod = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

const legacyPaymentMethodName = (normalized: string) =>
  LEGACY_PAYMENT_METHOD_LABELS[normalized] ??
  normalized.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const shouldCreatePayment = (row: CsvRow) => {
  if (row.status === 'deleted') return false;
  if (!normalizeLegacyPaymentMethod(row.paymentMethod)) return false;

  return Boolean(
    row.paymentCollectionStatus ||
      row.paymentReference ||
      row.paymentDisbursementDate ||
      numberValue(row.paymentsTotal) > 0 ||
      numberValue(row.paymentFee) > 0 ||
      numberValue(row.paymentNetAmount) > 0,
  );
};

const legacyGrossAmount = (row: CsvRow) => {
  const total = numberValue(row.total);
  const paymentsTotal = numberValue(row.paymentsTotal);
  const feeAmount = numberValue(row.paymentFee);
  const netAmount = numberValue(row.paymentNetAmount);

  if (paymentsTotal > 0 && feeAmount > 0) return Math.max(total, paymentsTotal + feeAmount);
  if (netAmount > 0 && feeAmount > 0) return Math.max(total, netAmount + feeAmount);
  if (paymentsTotal > 0) return paymentsTotal;
  if (row.paymentCollectionStatus === 'received') return total;

  return total;
};

const createCounters = (): Counters => ({
  users: 0,
  organizations: 0,
  memberships: 0,
  roles: 0,
  subscriptions: 0,
  paymentMethods: 0,
  documents: 0,
  payments: 0,
  warnings: [],
});

const buildUser = (row: CsvRow): Partial<User> & { _id: string } => {
  const email = row.email.trim().toLowerCase();
  const firstName = row.name.trim();
  const lastName = row.lastname.trim();
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    _id: row._id,
    name: displayName || email,
    phone: row.phone,
    newsletter: boolValue(row.newsletter),
    photo: row.photo,
    provider: row.method === 'google' ? ({ google: row._id } as User['provider']) : undefined,
    username: row.username || email,
    email,
    lastLogin: isoDate(row.lastLogin, new Date(row.updatedAt || row.createdAt || Date.now())),
    loginAttempts: numberValue(row.loginAttempts),
    twoFactorAuth: false,
    locked: row.status === 'locked',
    identification: '',
    lifecycleStatus: row.status === 'active' ? LifecycleStatus.ACTIVE : LifecycleStatus.INACTIVE,
    deletedAt: null,
  };
};

const buildOrganization = (row: CsvRow): Partial<Organization> & { _id: string } => {
  const country = row.country === 'CO' ? 'Colombia' : row.country || 'Colombia';

  return {
    _id: row._id,
    name: row.name,
    legalName: row.name,
    taxId: '',
    email: `legacy-${row._id}@helebba.local`,
    phone: '',
    country,
    currency: row.country === 'CO' ? 'COP' : 'USD',
    timezone: row.country === 'CO' ? 'America/Bogota' : 'UTC',
    logoUrl: '',
    type: row.type || 'company',
    size: row.employees,
    structure: row.structure,
    website: row.website,
    isPrincipal: boolValue(row.isPrincipal),
    slug: slugify(row.name) || `legacy-${row._id}`,
    ownerId: row.ownerId as UserId,
    createdBy: row.ownerId,
    updatedBy: row.ownerId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  };
};

const buildLine = (row: CsvRow) => {
  const concept = row['products[0].concept'] || row.desc || 'Documento legacy';
  const price = numberValue(row['products[0].price'], numberValue(row.total));
  const units = numberValue(row['products[0].amount'], 1) || 1;

  return {
    id: row['products[0].id'] || row['products[0]._id'] || row._id,
    concept,
    description: row['products[0].description'] || row.desc,
    price,
    units,
    tax: numberValue(row['products[0].tax']),
    taxes: [],
    tags: [],
    productId: row['products[0].id'],
    variantId: '',
    serviceId: '',
    account: '',
    projectId: '',
    retention: '',
    unitType: 'unit',
  };
};

const buildDocument = (
  row: CsvRow,
  ownerId: string,
  paymentMethodId: string,
): Partial<Document> & { _id: string } => {
  const docType = normalizeDocumentType(row.docType);
  const financialFeeValue = numberValue(row.paymentFee);

  return {
    _id: row._id,
    organizationId: row.account as OrganizationId,
    createdBy: ownerId,
    updatedBy: ownerId,
    contactId: row.contact,
    contactName: row.contactName,
    description: row.desc || row['products[0].concept'],
    date: isoDate(row.date, new Date(row.createdAt || Date.now())),
    dueDate: isoDate(row.dueDate || row.date, new Date(row.createdAt || Date.now())),
    disbursementDate: row.paymentDisbursementDate
      ? isoDate(row.paymentDisbursementDate)
      : undefined,
    subtotal: numberValue(row.subtotal),
    discount: numberValue(row.discount),
    total: numberValue(row.total),
    tax: numberValue(row.tax),
    currency: row.currency || 'COP',
    status: numberValue(row.statusDocument, StatusDocument.Pending) as Document['status'],
    tags: [],
    lines: [buildLine(row)],
    paymentMethodId,
    financialFeePaymentMethodId: paymentMethodId,
    financialFeeName: financialFeeValue > 0 ? 'Comision legacy' : undefined,
    financialFeeType: financialFeeValue > 0 ? 'custom' : 'none',
    financialFeeValue,
    paymentsTotal: numberValue(row.paymentsTotal),
    paymentsPending: numberValue(
      row.paymentsPending,
      Math.max(numberValue(row.total) - numberValue(row.paymentsTotal), 0),
    ),
    language: row.language || 'es',
    designId: row.designId,
    docType,
    customFields: [
      { field: 'legacyId', value: row._id },
      { field: 'legacyPaymentMethod', value: row.paymentMethod },
      { field: 'legacyCollectionStatus', value: row.paymentCollectionStatus },
    ].filter((field) => field.value),
    docNumber: row.docNumber,
    lifecycleStatus: row.status === 'deleted' ? LifecycleStatus.DELETED : LifecycleStatus.ACTIVE,
    deletedAt: null,
  };
};

const buildPayment = (
  document: Partial<Document> & { _id: string },
  row: CsvRow,
): Partial<Payment> & { _id: string } => {
  const grossAmount = legacyGrossAmount(row);
  const feeAmount = Math.max(
    numberValue(row.paymentFee, numberValue(document.financialFeeValue)),
    0,
  );
  const direction = documentDirection(String(document.docType));
  const legacyNetAmount = numberValue(row.paymentNetAmount);
  const netAmount =
    legacyNetAmount > 0
      ? legacyNetAmount
      : direction === 'inflow'
        ? Math.max(grossAmount - feeAmount, 0)
        : grossAmount + feeAmount;
  const collectionStatus = String(row.paymentCollectionStatus || '').trim().toLowerCase();

  return {
    _id: `legacy-payment-${document._id}`,
    organizationId: document.organizationId,
    createdBy: document.createdBy,
    updatedBy: document.updatedBy,
    bankAccountId: '',
    paymentMethodId: document.paymentMethodId,
    contactId: document.contactId,
    contactName: document.contactName,
    amount: grossAmount,
    grossAmount,
    feeAmount,
    netAmount,
    direction,
    financialFeePaymentMethodId: document.financialFeePaymentMethodId,
    feeName: document.financialFeeName,
    feeType: document.financialFeeType,
    feeValue: document.financialFeeValue,
    description: `Pago importado ${document.docNumber || document._id}`,
    date: isoDate(row.paymentDisbursementDate || row.date),
    status: 'assigned',
    reconciliationStatus: collectionStatus === 'received' ? 'reconciled' : 'pending',
    totalDocuments: 1,
    totalTransactions: 0,
    totalAdvance: 0,
    documentType: document.docType as DocumentType,
    documentId: document._id,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  };
};

const upsert = async <T extends { _id: string }>(
  enabled: boolean,
  model: { updateOne: (...args: unknown[]) => Promise<unknown> },
  data: Partial<T> & { _id: string },
) => {
  if (!enabled) return;

  await model.updateOne(
    { _id: data._id },
    {
      $set: data,
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
};

const findRole = async (organizationId: string, code: string) => {
  const roleModel = getModel<Role>(Collection.ROLES, RoleSchemaMongo);

  return roleModel.findOne({
    organizationId,
    code,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
};

const ensureSubscription = async ({
  account,
  owner,
  write,
}: {
  account: CsvRow;
  owner?: CsvRow;
  write: boolean;
}) => {
  const subscriptionModel = getModel<Subscription>(
    Collection.SUBSCRIPTIONS,
    SubscriptionSchemaMongo,
  );
  const existing = await subscriptionModel.findOne({ organizationId: account._id });

  if (existing || !write) return;

  const now = new Date();
  const trialStartedAt = isoDate(owner?.trialStartDate, now);
  const trialEndsAt = isoDate(
    owner?.trialEndDate,
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  );
  const trialEndDate = new Date(trialEndsAt);
  const status = trialEndDate.getTime() > now.getTime() ? 'trialing' : 'active';
  const planCode = normalizePlan(owner?.plan);

  await subscriptionModel.create({
    organizationId: account._id,
    plan: createPlanSnapshot({ planCode, interval: 'monthly' }),
    status,
    trialStartedAt,
    trialEndsAt,
    currentPeriodStartedAt: trialStartedAt,
    currentPeriodEndsAt: trialEndsAt,
    provider: 'manual',
    metadata: {
      source: 'legacy-csv',
    },
    createdBy: account.ownerId,
    updatedBy: account.ownerId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
};

const ensureMembership = async ({
  account,
  user,
  role,
  isDefault,
  write,
}: {
  account: CsvRow;
  user: CsvRow;
  role: Role;
  isDefault: boolean;
  write: boolean;
}) => {
  const membershipModel = getModel<Membership>(Collection.MEMBERSHIPS, MembershipSchemaMongo);
  const userId = user._id as UserId;
  const organizationId = account._id as OrganizationId;
  const data: Partial<Membership> = {
    organizationId,
    userId,
    invitedEmail: user.email.trim().toLowerCase(),
    roleIds: [getEntityId(role)],
    roleId: getEntityId(role),
    permissionKeys: role.permissionKeys,
    title: role.code === SYSTEM_ROLE_CODES.TENANT_OWNER ? 'Propietario' : 'Miembro',
    joinedAt: isoDate(account.createdAt),
    status: 'active',
    profile: {
      displayName: buildUser(user).name,
      avatar: user.photo,
    },
    preferences: {
      notifications: {
        email: true,
        inApp: true,
      },
    },
    isDefault,
    lastSelectedAt: isoDate(account.updatedAt || account.createdAt),
    createdBy: account.ownerId,
    updatedBy: account.ownerId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  };

  if (!write) return;

  await membershipModel.updateOne(
    { organizationId, userId },
    {
      $set: data,
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );
};

const ensureLegacyPaymentMethod = async ({
  account,
  legacyPaymentMethod,
  write,
}: {
  account: CsvRow;
  legacyPaymentMethod: string;
  write: boolean;
}) => {
  const paymentMethodModel = getModel<PaymentMethod>(
    Collection.PAYMENT_METHODS,
    PaymentMethodSchemaMongo,
  );
  const normalized = normalizeLegacyPaymentMethod(legacyPaymentMethod);
  const organizationId = account._id as OrganizationId;

  if (!normalized) {
    const defaultMethod = await paymentMethodModel.findOne({
      organizationId,
      isDefault: true,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    });

    return defaultMethod ? getEntityId(defaultMethod) : '';
  }

  if (normalized === 'cash') {
    const cash = await paymentMethodModel.findOne({
      organizationId,
      type: 'cash',
      lifecycleStatus: LifecycleStatus.ACTIVE,
    });

    if (cash) return getEntityId(cash);
  }

  if (normalized === 'bank') {
    const bankTransfer = await paymentMethodModel.findOne({
      organizationId,
      type: 'bank_transfer',
      lifecycleStatus: LifecycleStatus.ACTIVE,
    });

    if (bankTransfer) return getEntityId(bankTransfer);
  }

  const existing = await paymentMethodModel.findOne({
    organizationId,
    'metadata.legacyKey': normalized,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (existing) return getEntityId(existing);

  const data = {
    _id: `legacy-payment-method-${organizationId}-${normalized}`,
    organizationId,
    createdBy: account.ownerId,
    updatedBy: account.ownerId,
    name: legacyPaymentMethodName(normalized),
    type: normalized === 'cash' ? 'cash' : 'other',
    status: 'active',
    isDefault: false,
    dueDays: 0,
    settlementMode: 'instant',
    disbursementRule: 'immediate',
    financialFeeType: 'none',
    financialFeeValue: 0,
    metadata: {
      legacyKey: normalized,
      source: 'legacy-csv',
    },
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  } as Partial<PaymentMethod> & { _id: string };

  await upsert(write, paymentMethodModel, data);

  return data._id;
};

const runImport = async (options: ImportOptions) => {
  const counters = createCounters();
  const [users, accounts, documents] = await Promise.all([
    readCsv(options.usersPath),
    readCsv(options.accountsPath),
    readCsv(options.documentsPath),
  ]);
  const usersById = new Map(users.map((user) => [user._id, user]));
  const accountsById = new Map(accounts.map((account) => [account._id, account]));
  const documentsByPaymentMethod = new Map<string, Set<string>>();

  documents.forEach((document) => {
    if (!document.paymentMethod || !document.account) return;
    const values = documentsByPaymentMethod.get(document.account) ?? new Set<string>();
    values.add(document.paymentMethod);
    documentsByPaymentMethod.set(document.account, values);
  });

  const userModel = getModel<User & { _id: string }>(Collection.USERS, UserSchemaMongo);
  const organizationModel = getModel<Organization & { _id: string }>(
    Collection.ORGANIZATIONS,
    OrganizationSchemaMongo,
  );
  const documentModel = getModel<Document & { _id: string }>(
    Collection.DOCUMENTS,
    DocumentSchemaMongo,
  );
  const paymentModel = getModel<Payment & { _id: string }>(Collection.PAYMENTS, PaymentSchemaMongo);

  for (const row of users) {
    if (!row._id || !row.email) {
      counters.warnings.push(`Usuario omitido por falta de _id/email: ${JSON.stringify(row)}`);
      continue;
    }

    await upsert(options.write, userModel, buildUser(row));
    counters.users += 1;
  }

  for (const account of accounts) {
    if (!account._id || !account.ownerId) {
      counters.warnings.push(`Cuenta omitida por falta de _id/ownerId: ${JSON.stringify(account)}`);
      continue;
    }

    if (!usersById.has(account.ownerId)) {
      counters.warnings.push(
        `Cuenta ${account.name} apunta a ownerId inexistente: ${account.ownerId}`,
      );
      continue;
    }

    await upsert(options.write, organizationModel, buildOrganization(account));
    counters.organizations += 1;

    if (options.write) {
      const roles = await seedDefaultRoles({
        createdBy: account.ownerId as UserId,
        organizationId: account._id as OrganizationId,
      });
      counters.roles += roles.length;

      await seedDefaultPaymentMethods({
        userId: account.ownerId as UserId,
        organizationId: account._id as OrganizationId,
      });
    }

    const ownerRole =
      (await findRole(account._id, SYSTEM_ROLE_CODES.TENANT_OWNER)) ??
      ({ id: '', permissionKeys: [] } as unknown as Role);
    const memberRole = (await findRole(account._id, SYSTEM_ROLE_CODES.MEMBER)) ?? ownerRole;
    const members = [
      account.ownerId,
      account['users[0]'],
      account['users[1]'],
      account['users[2]'],
      account['users[3]'],
    ]
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index);

    for (const memberId of members) {
      const member = usersById.get(memberId);

      if (!member) {
        counters.warnings.push(`Miembro ${memberId} omitido en ${account.name}: usuario no existe`);
        continue;
      }

      await ensureMembership({
        account,
        user: member,
        role: memberId === account.ownerId ? ownerRole : memberRole,
        isDefault: memberId === account.ownerId && boolValue(account.isPrincipal),
        write: options.write,
      });
      counters.memberships += 1;
    }

    await ensureSubscription({
      account,
      owner: usersById.get(account.ownerId),
      write: options.write,
    });
    counters.subscriptions += 1;

    const legacyMethods = documentsByPaymentMethod.get(account._id) ?? new Set();

    for (const legacyPaymentMethod of Array.from(legacyMethods)) {
      await ensureLegacyPaymentMethod({ account, legacyPaymentMethod, write: options.write });
      counters.paymentMethods += 1;
    }
  }

  for (const row of documents) {
    if (!row._id || !row.account) {
      counters.warnings.push(`Documento omitido por falta de _id/account: ${JSON.stringify(row)}`);
      continue;
    }

    const account = accountsById.get(row.account);

    if (!account) {
      counters.warnings.push(`Documento ${row._id} apunta a cuenta inexistente: ${row.account}`);
      continue;
    }

    const paymentMethodId = await ensureLegacyPaymentMethod({
      account,
      legacyPaymentMethod: row.paymentMethod,
      write: options.write,
    });
    const document = buildDocument(row, account.ownerId, paymentMethodId);

    await upsert(options.write, documentModel, document);
    counters.documents += 1;

    if (shouldCreatePayment(row)) {
      await upsert(options.write, paymentModel, buildPayment(document, row));
      counters.payments += 1;
    }
  }

  return counters;
};

const runParseOnly = async (options: ImportOptions) => {
  const counters = createCounters();
  const [users, accounts, documents] = await Promise.all([
    readCsv(options.usersPath),
    readCsv(options.accountsPath),
    readCsv(options.documentsPath),
  ]);
  const usersById = new Set(users.map((user) => user._id).filter(Boolean));
  const accountsById = new Set(accounts.map((account) => account._id).filter(Boolean));
  const legacyPaymentMethods = new Set<string>();

  counters.users = users.filter((user) => user._id && user.email).length;
  counters.organizations = accounts.filter((account) => account._id && account.ownerId).length;
  counters.documents = documents.filter((document) => document._id && document.account).length;
  counters.payments = documents.filter((document) => shouldCreatePayment(document)).length;

  accounts.forEach((account) => {
    if (!account.ownerId || usersById.has(account.ownerId)) return;
    counters.warnings.push(
      `Cuenta ${account.name} apunta a ownerId inexistente: ${account.ownerId}`,
    );
  });

  documents.forEach((document) => {
    if (!document.account || accountsById.has(document.account)) return;
    counters.warnings.push(
      `Documento ${document._id} apunta a cuenta inexistente: ${document.account}`,
    );
  });

  documents.forEach((document) => {
    if (document.account && document.paymentMethod) {
      legacyPaymentMethods.add(`${document.account}:${document.paymentMethod}`);
    }
  });

  counters.paymentMethods = legacyPaymentMethods.size;
  counters.memberships = accounts.reduce((total, account) => {
    const members = [
      account.ownerId,
      account['users[0]'],
      account['users[1]'],
      account['users[2]'],
      account['users[3]'],
    ].filter(Boolean);

    return total + new Set(members).size;
  }, 0);
  counters.subscriptions = counters.organizations;

  return counters;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  MonoContext.setState({ name: 'legacy-import', version: '1.0.0', secret: null });
  const logger = createLogger();
  MonoContext.setState({ logger });
  setLogger(logger);

  if (options.parseOnly) {
    const counters = await runParseOnly(options);
    printCounters('Parse-only completado. No se conecto a MongoDB.', counters);
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Falta MONGODB_URI en el entorno o en apps/edge/.env');
  }

  await initDataSources({
    mongoose: {
      mongoUri: process.env.MONGODB_URI,
    },
  });

  const counters = await runImport(options);

  printCounters(
    options.write ? 'Importacion ejecutada.' : 'Dry-run completado. No se escribio nada.',
    counters,
  );

  await disconnectMongoose();
};

const printCounters = (title: string, counters: Counters) => {
  console.info(title);
  console.table({
    users: counters.users,
    organizations: counters.organizations,
    memberships: counters.memberships,
    roles: counters.roles,
    subscriptions: counters.subscriptions,
    paymentMethods: counters.paymentMethods,
    documents: counters.documents,
    payments: counters.payments,
    warnings: counters.warnings.length,
  });

  counters.warnings.slice(0, 25).forEach((warning) => console.warn(`WARN: ${warning}`));
  if (counters.warnings.length > 25) {
    console.warn(`WARN: ${counters.warnings.length - 25} warnings adicionales no mostrados.`);
  }
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch(async (error) => {
    console.error(error);
    await disconnectMongoose();
    process.exit(1);
  });
}

const disconnectMongoose = async () => {
  const dataSources = MonoContext.getStateValue('dataSources') as
    | { mongoose?: { disconnect?: () => Promise<void> } }
    | undefined;

  await dataSources?.mongoose?.disconnect?.();
};
