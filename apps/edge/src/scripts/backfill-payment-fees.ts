import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { Collection, getModel, setLogger } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  DocumentType,
  LifecycleStatus,
  PaymentSchemaMongo,
  type Document,
  type Payment,
} from '@hlb/contracts';
import { initDataSources } from '@hlb/data-sources';
import { ConsoleTransport, Logger, LoggerTransportName, MonoContext } from '@hlb/kernel';

const EDGE_ENV_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');

loadDotenv({ quiet: true });
loadDotenv({ path: EDGE_ENV_PATH, quiet: true });

type BackfillOptions = {
  createMissingPayments: boolean;
  limit: number;
  organizationId?: string;
  overwrite: boolean;
  write: boolean;
};

type Counters = {
  checked: number;
  created: number;
  documentsChecked: number;
  missingDocument: number;
  missingPayment: number;
  skippedNoFee: number;
  skippedExistingFee: number;
  updated: number;
  warnings: string[];
};

const usage = `
Recalcula comisiones de payments desde su factura/documento asociado.

Por defecto corre en dry-run. Usa --write para escribir en MongoDB.

Uso:
  pnpm --filter edge run payments:backfill-fees -- --write

Opciones:
  --organization <id>  Limita el proceso a una organización.
  --limit <number>     Máximo de pagos a revisar. Default: 5000
  --create-missing     Crea payments faltantes para documentos con comisión.
  --overwrite          Recalcula aunque el pago ya tenga feeAmount > 0.
  --write              Ejecuta escrituras. Sin esto solo muestra conteos.
  --help               Muestra esta ayuda.
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
      app: 'payment-fee-backfill',
      version: '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
      developer: os.userInfo().username,
    },
    catchTransportErrors: true,
    logLevel: 'all',
  });

const parseArgs = (argv: string[]): BackfillOptions => {
  const options: BackfillOptions = {
    createMissingPayments: false,
    limit: 5000,
    overwrite: false,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      console.info(usage.trim());
      process.exit(0);
    }

    if (arg === '--') continue;

    if (arg === '--write') {
      options.write = true;
      continue;
    }

    if (arg === '--overwrite') {
      options.overwrite = true;
      continue;
    }

    if (arg === '--create-missing') {
      options.createMissingPayments = true;
      continue;
    }

    if (arg === '--organization') {
      options.organizationId = requireNextValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === '--limit') {
      const limit = Number(requireNextValue(argv, index, arg));
      if (!Number.isFinite(limit) || limit <= 0) {
        throw new Error('--limit debe ser un numero positivo');
      }
      options.limit = limit;
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

const numberValue = (value: unknown) => {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
};

const roundMoney = (value: number) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const getEntityId = (entity: { id?: unknown; _id?: unknown }) => String(entity.id ?? entity._id);

const directionFromDocument = (document: Document): Payment['direction'] =>
  document.docType === DocumentType.PURCHASE || document.docType === DocumentType.EXPENSES
    ? 'outflow'
    : 'inflow';

const buildPaymentUpdate = (payment: Payment, document: Document): Partial<Payment> | null => {
  const feeAmount = roundMoney(Math.max(numberValue(document.financialFeeValue), 0));

  if (feeAmount <= 0) return null;

  const direction = payment.direction ?? directionFromDocument(document);
  const grossAmount = roundMoney(
    numberValue(payment.grossAmount ?? payment.amount ?? document.total),
  );
  const netAmount = roundMoney(
    direction === 'inflow' ? Math.max(grossAmount - feeAmount, 0) : grossAmount + feeAmount,
  );

  return {
    direction,
    grossAmount,
    amount: grossAmount,
    feeAmount,
    netAmount,
    financialFeePaymentMethodId:
      document.financialFeePaymentMethodId ??
      payment.financialFeePaymentMethodId ??
      document.paymentMethodId,
    feeName: document.financialFeeName ?? payment.feeName ?? 'Comision financiera',
    feeType: document.financialFeeType ?? payment.feeType ?? 'custom',
    feeValue: feeAmount,
    paymentMethodId: payment.paymentMethodId ?? document.paymentMethodId,
  };
};

const buildMissingPayment = (document: Document): Partial<Payment> & { _id: string } => {
  const direction = directionFromDocument(document);
  const grossAmount = roundMoney(numberValue(document.total));
  const feeAmount = roundMoney(Math.max(numberValue(document.financialFeeValue), 0));
  const netAmount = roundMoney(
    direction === 'inflow' ? Math.max(grossAmount - feeAmount, 0) : grossAmount + feeAmount,
  );
  const documentId = getEntityId(document);

  return {
    _id: `backfill-payment-${documentId}`,
    organizationId: document.organizationId,
    createdBy: document.updatedBy ?? document.createdBy,
    updatedBy: document.updatedBy ?? document.createdBy,
    bankAccountId: '',
    paymentMethodId: document.paymentMethodId,
    contactId: document.contactId,
    contactName: document.contactName,
    amount: grossAmount,
    direction,
    grossAmount,
    feeAmount,
    netAmount,
    financialFeePaymentMethodId: document.financialFeePaymentMethodId ?? document.paymentMethodId,
    feeName: document.financialFeeName ?? 'Comision financiera',
    feeType: document.financialFeeType ?? 'custom',
    feeValue: feeAmount,
    description: `Pago generado por backfill ${document.docNumber || documentId}`,
    date: document.disbursementDate ?? document.date,
    status: 'assigned',
    reconciliationStatus: 'pending',
    totalDocuments: 1,
    totalTransactions: 0,
    totalAdvance: 0,
    documentType: document.docType as DocumentType,
    documentId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  };
};

const createCounters = (): Counters => ({
  checked: 0,
  created: 0,
  documentsChecked: 0,
  missingDocument: 0,
  missingPayment: 0,
  skippedNoFee: 0,
  skippedExistingFee: 0,
  updated: 0,
  warnings: [],
});

const runBackfill = async (options: BackfillOptions) => {
  const counters = createCounters();
  const paymentModel = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const documentModel = getModel<Document>(Collection.DOCUMENTS, DocumentSchemaMongo);
  const paymentFilter = {
    lifecycleStatus: LifecycleStatus.ACTIVE,
    documentId: { $exists: true, $nin: ['', null] },
    ...(options.organizationId ? { organizationId: options.organizationId } : {}),
    ...(options.overwrite
      ? {}
      : {
          $or: [{ feeAmount: { $exists: false } }, { feeAmount: null }, { feeAmount: 0 }],
        }),
  };
  const payments = await paymentModel.find(paymentFilter).limit(options.limit);

  for (const payment of payments) {
    counters.checked += 1;

    const document = await documentModel.findOne({
      _id: payment.documentId,
      organizationId: payment.organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    });

    if (!document) {
      counters.missingDocument += 1;
      counters.warnings.push(`Pago ${getEntityId(payment)} no tiene documento activo asociado`);
      continue;
    }

    if (!options.overwrite && numberValue(payment.feeAmount) > 0) {
      counters.skippedExistingFee += 1;
      continue;
    }

    const update = buildPaymentUpdate(payment, document);

    if (!update) {
      counters.skippedNoFee += 1;
      continue;
    }

    counters.updated += 1;

    if (!options.write) continue;

    await paymentModel.updateOne(
      { _id: getEntityId(payment) },
      {
        $set: {
          ...update,
          updatedAt: new Date(),
        },
      },
    );
  }

  const documentFilter = {
    lifecycleStatus: LifecycleStatus.ACTIVE,
    financialFeeValue: { $gt: 0 },
    ...(options.organizationId ? { organizationId: options.organizationId } : {}),
  };
  const documentsWithFee = await documentModel.find(documentFilter).limit(options.limit);

  for (const document of documentsWithFee) {
    counters.documentsChecked += 1;

    const existingPayment = await paymentModel.findOne({
      documentId: getEntityId(document),
      organizationId: document.organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    });

    if (existingPayment) continue;

    counters.missingPayment += 1;

    if (!options.createMissingPayments) continue;

    const payment = buildMissingPayment(document);
    counters.created += 1;

    if (!options.write) continue;

    await paymentModel.updateOne(
      { _id: payment._id },
      {
        $set: payment,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  return counters;
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  MonoContext.setState({ name: 'payment-fee-backfill', version: '1.0.0', secret: null });
  const logger = createLogger();
  MonoContext.setState({ logger });
  setLogger(logger);

  if (!process.env.MONGODB_URI) {
    throw new Error('Falta MONGODB_URI en el entorno o en apps/edge/.env');
  }

  await initDataSources({
    mongoose: {
      mongoUri: process.env.MONGODB_URI,
    },
  });

  const counters = await runBackfill(options);

  printCounters(
    options.write ? 'Backfill ejecutado.' : 'Dry-run completado. No se escribio nada.',
    counters,
  );

  await disconnectMongoose();
};

const printCounters = (title: string, counters: Counters) => {
  console.info(title);
  console.table({
    checked: counters.checked,
    updated: counters.updated,
    documentsChecked: counters.documentsChecked,
    missingPayment: counters.missingPayment,
    created: counters.created,
    skippedNoFee: counters.skippedNoFee,
    skippedExistingFee: counters.skippedExistingFee,
    missingDocument: counters.missingDocument,
    warnings: counters.warnings.length,
  });

  counters.warnings.slice(0, 25).forEach((warning) => console.warn(`WARN: ${warning}`));
  if (counters.warnings.length > 25) {
    console.warn(`WARN: ${counters.warnings.length - 25} warnings adicionales no mostrados.`);
  }
};

const disconnectMongoose = async () => {
  const dataSources = MonoContext.getStateValue('dataSources') as
    | { mongoose?: { disconnect?: () => Promise<void> } }
    | undefined;

  await dataSources?.mongoose?.disconnect?.();
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch(async (error) => {
    console.error(error);
    await disconnectMongoose();
    process.exit(1);
  });
}
