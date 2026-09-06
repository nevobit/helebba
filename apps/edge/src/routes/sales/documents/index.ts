import { DocumentType } from '@hlb/contracts';
import { createDocumentRoutes } from './factory';

export const invoiceRoutes = createDocumentRoutes('/invoices', DocumentType.INVOICE);
export const salesReceiptRoutes = createDocumentRoutes(
  '/sales-receipts',
  DocumentType.SALES_RECEIPT,
);
export const creditNoteRoutes = createDocumentRoutes('/credit-notes', DocumentType.CREDIT_NOTE);
export const receiptNoteRoutes = createDocumentRoutes('/receipt-notes', DocumentType.RECEIPT_NOTE);
export const estimateRoutes = createDocumentRoutes('/estimates', DocumentType.ESTIMATE);
export const salesOrderRoutes = createDocumentRoutes('/sales-orders', DocumentType.SALES_ORDER);
export const waybillRoutes = createDocumentRoutes('/waybills', DocumentType.WAYBILL);
export const proformRoutes = createDocumentRoutes('/proformas', DocumentType.PROFORM);
export const purchaseRoutes = createDocumentRoutes('/purchases', DocumentType.PURCHASE);
export const purchaseRefundRoutes = createDocumentRoutes(
  '/purchase-refunds',
  DocumentType.PURCHASE_REFUND,
);
export const purchaseOrderRoutes = createDocumentRoutes(
  '/purchase-orders',
  DocumentType.PURCHASE_ORDER,
);
export const referralRoutes = createDocumentRoutes('/purchase-shipments', DocumentType.REFERRALS);
export const quoteRoutes = createDocumentRoutes('/quotes', DocumentType.QUOTES);
export const expenseRoutes = createDocumentRoutes('/expenses', DocumentType.EXPENSES);
