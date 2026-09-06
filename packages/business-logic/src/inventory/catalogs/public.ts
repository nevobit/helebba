import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CatalogOrderSchemaMongo,
  CatalogSchemaMongo,
  LifecycleStatus,
  OrganizationSchemaMongo,
  ProductSchemaMongo,
  type Catalog,
  type CatalogOrder,
  type CatalogOrderCustomer,
  type Organization,
  type Product,
  type PublicCatalog,
} from '@hlb/contracts';

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const normalizeColor = (color: unknown) => {
  if (!color) return undefined;
  if (typeof color === 'string') return { name: color, hex: color };
  const value = color as { name?: string; hex?: string };
  return value.hex ? { name: value.name ?? value.hex, hex: value.hex } : undefined;
};

const getActiveCatalog = async (publicId: string) =>
  getModel<Catalog>(Collection.CATALOGS, CatalogSchemaMongo).findOne({
    publicId,
    active: true,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });

const catalogProductFilter = (catalog: Catalog) => ({
  organizationId: catalog.organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  forSale: true,
  inCatalog: true,
  ...(catalog.selectionMode === 'specific' ? { _id: { $in: catalog.productIds.map(String) } } : {}),
});

export const getPublicCatalog = async (publicId: string): Promise<PublicCatalog | null> => {
  const catalog = await getActiveCatalog(publicId);
  if (!catalog) return null;
  const [products, organization] = await Promise.all([
    getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo).find(catalogProductFilter(catalog)),
    getModel<Organization>(Collection.ORGANIZATIONS, OrganizationSchemaMongo).findById(catalog.organizationId),
  ]);
  const order = catalog.sortOrder;
  products.sort((left, right) => {
    if (order === 'name-asc') return left.name.localeCompare(right.name);
    if (order === 'name-desc') return right.name.localeCompare(left.name);
    if (order === 'price-asc') return Number(left.price ?? 0) - Number(right.price ?? 0);
    if (order === 'price-desc') return Number(right.price ?? 0) - Number(left.price ?? 0);
    const manual = catalog.productIds.map(String);
    return manual.indexOf(String(left.id)) - manual.indexOf(String(right.id));
  });
  const showPrices = catalog.settings.showPrices;
  const showStock = catalog.settings.showStock;
  const allowOutOfStock = catalog.settings.allowOutOfStockOrders;
  return {
    id: String(catalog.id),
    publicId: catalog.publicId,
    name: catalog.name,
    slug: catalog.slug,
    currency: organization?.currency ?? 'COP',
    settings: {
      showPrices,
      showStock,
      allowOutOfStockOrders: allowOutOfStock,
      importProductDescription: catalog.settings.importProductDescription,
    },
    products: products.map((product) => ({
      id: String(product.id),
      name: product.name,
      slug: product.slug,
      description: catalog.settings.importProductDescription ? product.description : undefined,
      images: product.images ?? [],
      sku: product.sku,
      price: showPrices ? Number(product.price ?? 0) : undefined,
      taxRate: Number(product.taxRate ?? 0),
      stock: showStock ? Number(product.stock ?? 0) : undefined,
      available: allowOutOfStock || !product.hasStock || Number(product.stock ?? 0) > 0,
      variants: (product.variants ?? []).map((variant) => ({
        id: String(variant.id ?? variant.variantId ?? ''),
        name: variant.name,
        sku: variant.sku,
        price: showPrices ? Number(variant.price ?? product.price ?? 0) : undefined,
        color: normalizeColor(variant.color),
        size: variant.size,
        stock: showStock ? Number(variant.stock ?? 0) : undefined,
        available: allowOutOfStock || Number(variant.stock ?? 0) > 0,
      })),
    })),
  };
};

export interface CreateCatalogOrderInput {
  publicId: string;
  customer: CatalogOrderCustomer;
  items: Array<{ productId: string; variantId?: string; quantity: number }>;
}

export const createCatalogOrder = async (input: CreateCatalogOrderInput) => {
  const catalog = await getActiveCatalog(input.publicId);
  if (!catalog) throw new Error('CATALOG_NOT_FOUND');
  const name = input.customer.name?.trim();
  const email = input.customer.email?.trim().toLowerCase();
  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('INVALID_CUSTOMER');
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 100) {
    throw new Error('INVALID_ORDER_LINES');
  }
  const requestedIds = [...new Set(input.items.map((item) => String(item.productId)))];
  const products = await getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo).find({
    ...catalogProductFilter(catalog),
    _id: { $in: requestedIds },
  });
  if (products.length !== requestedIds.length) throw new Error('PRODUCT_NOT_AVAILABLE');
  const productsById = new Map(products.map((product) => [String(product.id), product]));
  const lines = input.items.map((item) => {
    const product = productsById.get(String(item.productId));
    if (!product) throw new Error('PRODUCT_NOT_AVAILABLE');
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999) throw new Error('INVALID_QUANTITY');
    const variant = item.variantId
      ? (product.variants ?? []).find((value) => String(value.id ?? value.variantId) === String(item.variantId))
      : undefined;
    if (item.variantId && !variant) throw new Error('VARIANT_NOT_AVAILABLE');
    const stock = Number(variant?.stock ?? product.stock ?? 0);
    if (!catalog.settings.allowOutOfStockOrders && product.hasStock && stock < quantity) {
      throw new Error('INSUFFICIENT_STOCK');
    }
    const unitPrice = Number(variant?.price ?? product.price ?? 0);
    const taxRate = Number(product.taxRate ?? 0);
    const subtotal = roundMoney(unitPrice * quantity);
    const tax = roundMoney(subtotal * (taxRate / 100));
    return {
      productId: product.id,
      variantId: item.variantId,
      name: variant?.name ? `${product.name} · ${variant.name}` : product.name,
      sku: variant?.sku ?? product.sku,
      quantity,
      unitPrice,
      taxRate,
      subtotal,
      tax,
      total: roundMoney(subtotal + tax),
    };
  });
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.subtotal, 0));
  const tax = roundMoney(lines.reduce((sum, line) => sum + line.tax, 0));
  const organization = await getModel<Organization>(Collection.ORGANIZATIONS, OrganizationSchemaMongo).findById(catalog.organizationId);
  return getModel<CatalogOrder>(Collection.CATALOG_ORDERS, CatalogOrderSchemaMongo).create({
    organizationId: catalog.organizationId,
    catalogId: catalog.id,
    orderNumber: `CAT-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`,
    status: 'pending',
    currency: organization?.currency ?? 'COP',
    customer: { ...input.customer, name, email },
    lines,
    subtotal,
    tax,
    total: roundMoney(subtotal + tax),
  });
};

export const listCatalogOrders = async (organizationId: string, catalogId?: string) =>
  getModel<CatalogOrder>(Collection.CATALOG_ORDERS, CatalogOrderSchemaMongo)
    .find({ organizationId, ...(catalogId ? { catalogId } : {}) })
    .sort({ createdAt: -1 })
    .limit(500);
