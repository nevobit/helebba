import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  DocumentType,
  PosReceiptSchemaMongo,
  type Document,
  type OrganizationId,
  type PosReceipt,
  type ProductId,
} from '@hlb/contracts';

const firstDayOfMonth = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
};

export type ProductSalesStats = {
  soldThisMonth: {
    units: number;
    total: number;
  };
  buyers: {
    storeName: string;
    units: number;
    total: number;
  }[];
};

export const getProductSalesStats = async ({
  productId,
  organizationId,
}: {
  productId: ProductId;
  organizationId: OrganizationId;
}): Promise<ProductSalesStats> => {
  const receiptModel = getModel<PosReceipt>(Collection.POS_RECEIPTS, PosReceiptSchemaMongo);
  const monthStart = firstDayOfMonth();
  const productKey = String(productId);

  const receipts = await receiptModel
    .find({
      organizationId,
      status: 'completed',
      createdAt: { $gte: monthStart },
    })
    .select({ storeName: 1, lines: 1 })
    .lean();

  let soldUnits = 0;
  let soldTotal = 0;
  const buyers: Record<string, { storeName: string; units: number; total: number }> = {};

  for (const receipt of receipts) {
    for (const line of receipt.lines ?? []) {
      if (String(line.productId) !== productKey) continue;
      const units = Number(line.quantity ?? 0);
      const total = Number(line.total ?? 0);
      soldUnits += units;
      soldTotal += total;
      const existing = buyers[receipt.storeName] ?? {
        storeName: receipt.storeName,
        units: 0,
        total: 0,
      };
      existing.units += units;
      existing.total += total;
      buyers[receipt.storeName] = existing;
    }
  }

  return {
    soldThisMonth: { units: soldUnits, total: soldTotal },
    buyers: Object.values(buyers).sort((a, b) => b.units - a.units),
  };
};

export const getProductDocumentStats = async ({
  productId,
  organizationId,
}: {
  productId: ProductId;
  organizationId: OrganizationId;
}): Promise<{
  budgeted: { count: number; total: number };
  suppliers: { contactName: string; count: number; total: number }[];
}> => {
  const documentModel = getModel<Document>(Collection.DOCUMENTS, DocumentSchemaMongo);
  const productKey = String(productId);

  const documents = await documentModel
    .find({
      organizationId,
      'lines.productId': productKey,
    })
    .select({ docType: 1, contactName: 1, total: 1, lines: 1 })
    .lean();

  let budgetCount = 0;
  let budgetTotal = 0;
  const suppliers: Record<string, { contactName: string; count: number; total: number }> = {};

  for (const document of documents) {
    const lines = (document.lines ?? []).filter((line) => String(line.productId) === productKey);
    const lineTotal = lines.reduce((sum, line) => sum + Number(line.total ?? 0), 0);
    if (document.docType === DocumentType.ESTIMATE || document.docType === DocumentType.QUOTES) {
      budgetCount += 1;
      budgetTotal += lineTotal;
    }
    if (document.docType === DocumentType.PURCHASE) {
      const existing = suppliers[document.contactName] ?? {
        contactName: document.contactName,
        count: 0,
        total: 0,
      };
      existing.count += 1;
      existing.total += lineTotal;
      suppliers[document.contactName] = existing;
    }
  }

  return {
    budgeted: { count: budgetCount, total: budgetTotal },
    suppliers: Object.values(suppliers).sort((a, b) => b.total - a.total),
  };
};