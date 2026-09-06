import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CatalogSchemaMongo,
  LifecycleStatus,
  ProductSchemaMongo,
  type Catalog,
  type Product,
} from '@hlb/contracts';
import { slugify } from '@hlb/foundation';

export const validateCatalogProducts = async (data: Partial<Catalog>) => {
  if (data.selectionMode !== 'specific') return [];
  const productIds = [...new Set((data.productIds ?? []).map(String))];
  if (productIds.length === 0) throw new Error('Selecciona al menos un producto para el catálogo.');
  const count = await getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo).countDocuments({
    _id: { $in: productIds },
    organizationId: data.organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    forSale: true,
    inCatalog: true,
  });
  if (count !== productIds.length) throw new Error('Uno o más productos no están disponibles para catálogo.');
  return productIds;
};

export const createCatalog = async (data: Partial<Catalog>) => {
  const model = getModel<Catalog>(Collection.CATALOGS, CatalogSchemaMongo);
  const name = data.name?.trim();
  if (!name) throw new Error('Ingresa el nombre del catálogo.');
  const productIds = await validateCatalogProducts(data);
  const baseSlug = slugify(name) || `catalogo-${Date.now()}`;
  const existing = await model.countDocuments({ organizationId: data.organizationId, slug: baseSlug });
  const catalog = new model({
    ...data,
    name,
    slug: existing ? `${baseSlug}-${existing + 1}` : baseSlug,
    publicId: randomUUID(),
    active: true,
    selectionMode: data.selectionMode ?? 'all',
    productIds: data.selectionMode === 'specific' ? productIds : [],
    sortOrder: data.sortOrder ?? 'manual',
    settings: {
      importProductDescription: true,
      showPrices: true,
      showExchangeRatePrices: false,
      allowLotSelection: false,
      showStock: false,
      allowOutOfStockOrders: false,
      ...data.settings,
    },
  });
  return catalog.save();
};
