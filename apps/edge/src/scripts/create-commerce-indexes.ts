import 'dotenv/config';
import { Collection, getModel } from '@hlb/constant-definitions';
import { initDataSources } from '@hlb/data-sources';
import {
  CatalogOrderSchemaMongo,
  PosReceiptSchemaMongo,
  type CatalogOrder,
  type PosReceipt,
} from '@hlb/contracts';

const main = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  await initDataSources({ mongoose: { mongoUri: process.env.MONGODB_URI } });
  await Promise.all([
    getModel<CatalogOrder>(Collection.CATALOG_ORDERS, CatalogOrderSchemaMongo).createIndexes(),
    getModel<PosReceipt>(Collection.POS_RECEIPTS, PosReceiptSchemaMongo).createIndexes(),
  ]);
  process.stdout.write('Commerce indexes created successfully.\n');
  process.exit(0);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
