import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  DocumentType,
  LifecycleStatus,
  PosReceiptSchemaMongo,
  ProductSchemaMongo,
  type Document,
  type OrganizationId,
  type PosReceipt,
  type Product,
} from '@hlb/contracts';

export type InventoryAnalyticsRow = {
  id: string;
  sku: string;
  name: string;
  variant1: string;
  variant2: string;
  salesUnits: number;
  salesTotal: number;
  averageSalePrice: number;
  averageCost: number;
  margin: number;
};

const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const colorName = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const color = value as { name?: string; hex?: string; code?: string };
    return color.name || color.hex || color.code || '';
  }
  return '';
};

export const getInventoryAnalytics = async ({
  organizationId,
  startDate,
  endDate,
  page = 1,
  limit = 10,
  search = '',
}: {
  organizationId: OrganizationId;
  startDate: Date;
  endDate: Date;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const productModel = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const normalizedSearch = search.trim();
  const productFilter = {
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    ...(normalizedSearch
      ? { $or: [
          { name: { $regex: normalizedSearch, $options: 'i' } },
          { sku: { $regex: normalizedSearch, $options: 'i' } },
        ] }
      : {}),
  };
  const totalItems = await productModel.countDocuments(productFilter);
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);
  const products = await productModel
    .find(productFilter)
    .sort({ name: 1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();
  const ids = products.map((product) => String(product._id));
  if (!ids.length) return { items: [], totalItems, page: safePage, limit: safeLimit };

  const [receipts, documents] = await Promise.all([
    getModel<PosReceipt>(Collection.POS_RECEIPTS, PosReceiptSchemaMongo)
      .find({
        organizationId,
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate },
        'lines.productId': { $in: ids },
      })
      .select({ lines: 1 })
      .lean(),
    getModel<Document>(Collection.DOCUMENTS, DocumentSchemaMongo)
      .find({
        organizationId,
        lifecycleStatus: LifecycleStatus.ACTIVE,
        docType: { $in: [DocumentType.INVOICE, DocumentType.SALES_RECEIPT] },
        createdAt: { $gte: startDate, $lte: endDate },
        'lines.productId': { $in: ids },
      })
      .select({ lines: 1 })
      .lean(),
  ]);

  const sales = new Map<string, { units: number; total: number; cost: number; costedUnits: number }>();
  const add = (productId: unknown, units: number, total: number, cost: number, costedUnits = 0) => {
    const key = String(productId);
    const current = sales.get(key) ?? { units: 0, total: 0, cost: 0, costedUnits: 0 };
    current.units += units;
    current.total += total;
    current.cost += cost;
    current.costedUnits += costedUnits;
    sales.set(key, current);
  };
  receipts.forEach((receipt) => receipt.lines?.forEach((line) => {
    if (!ids.includes(String(line.productId))) return;
    add(line.productId, Number(line.quantity ?? 0), Number(line.total ?? 0), 0);
  }));
  documents.forEach((document) => document.lines?.forEach((line) => {
    if (!ids.includes(String(line.productId))) return;
    const units = Number(line.units ?? 0);
    const gross = Number(line.price ?? 0) * units;
    const total = gross * (1 - Number(line.discount ?? 0) / 100);
    const costPrice = Number(line.costPrice ?? 0);
    add(line.productId, units, total, costPrice * units, costPrice ? units : 0);
  }));

  const items: InventoryAnalyticsRow[] = products.map((product) => {
    const metric = sales.get(String(product._id)) ?? { units: 0, total: 0, cost: 0, costedUnits: 0 };
    const unitCost = Number(product.cost ?? product.purchasePrice ?? 0);
    const totalCost = metric.cost + unitCost * Math.max(0, metric.units - metric.costedUnits);
    const colors = [...new Set((product.variants ?? []).map((variant) => colorName(variant.color)).filter(Boolean))];
    const sizes = [...new Set((product.variants ?? []).map((variant) => variant.size).filter(Boolean))];
    return {
      id: String(product._id),
      sku: product.sku ?? '',
      name: product.name,
      variant1: colors.join(', '),
      variant2: sizes.join(', '),
      salesUnits: round(metric.units),
      salesTotal: round(metric.total),
      averageSalePrice: metric.units ? round(metric.total / metric.units) : 0,
      averageCost: metric.units ? round(totalCost / metric.units) : round(unitCost),
      margin: metric.total ? round(((metric.total - totalCost) / metric.total) * 100) : 0,
    };
  });
  return { items, totalItems, page: safePage, limit: safeLimit };
};
