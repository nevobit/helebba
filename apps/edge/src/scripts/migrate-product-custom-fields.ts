import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductFieldDefinitionSchemaMongo,
  ProductSchemaMongo,
  type Product,
  type ProductFieldDefinition,
} from '@hlb/contracts';
import { initDataSources } from '@hlb/data-sources';
import { slugify } from '@hlb/foundation';
import { MonoContext } from '@hlb/kernel';

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
loadDotenv({ path: envPath, quiet: true });

const write = process.argv.includes('--write');
const organizationArgIndex = process.argv.indexOf('--organization');
const organizationId = organizationArgIndex >= 0 ? process.argv[organizationArgIndex + 1] : undefined;

const main = async () => {
  if (!process.env.MONGODB_URI) throw new Error('Falta MONGODB_URI en apps/edge/.env');
  MonoContext.setState({ name: 'product-custom-fields-migration', version: '1.0.0', secret: null });
  await initDataSources({ mongoose: { mongoUri: process.env.MONGODB_URI } });

  const productModel = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const definitionModel = getModel<ProductFieldDefinition>(
    Collection.PRODUCT_FIELD_DEFINITIONS,
    ProductFieldDefinitionSchemaMongo,
  );
  const products = await productModel.find({
    ...(organizationId ? { organizationId } : {}),
    customFields: { $elemMatch: { field: { $exists: true }, definitionId: { $exists: false } } },
  });
  let migratedProducts = 0;
  let createdDefinitions = 0;

  for (const product of products) {
    const migratedFields = [];

    for (const customField of product.customFields ?? []) {
      if (customField.definitionId || !customField.field?.trim()) {
        migratedFields.push(customField);
        continue;
      }

      const key = slugify(customField.field).replace(/-/g, '_');
      let definition = await definitionModel.findOne({ organizationId: product.organizationId, key });

      if (!definition && write) {
        definition = await definitionModel.create({
          organizationId: product.organizationId,
          key,
          label: customField.field.trim(),
          type: 'text',
          target: 'product',
          required: false,
          active: true,
          order: 0,
          appliesTo: 'all',
          categoryIds: [],
          options: [],
          defaultValue: null,
          createdBy: product.createdBy,
          updatedBy: product.updatedBy ?? product.createdBy,
        });
        createdDefinitions += 1;
      }

      migratedFields.push(
        definition
          ? { definitionId: definition.id, value: customField.value }
          : customField,
      );
    }

    if (write) await productModel.updateOne({ _id: product.id }, { $set: { customFields: migratedFields } });
    migratedProducts += 1;
  }

  console.info(write ? 'Migración completada.' : 'Dry-run completado; usa --write para aplicar cambios.');
  console.table({ productsFound: products.length, migratedProducts, createdDefinitions });
  const dataSources = MonoContext.getStateValue('dataSources') as { mongoose?: { disconnect?: () => Promise<void> } } | undefined;
  await dataSources?.mongoose?.disconnect?.();
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
