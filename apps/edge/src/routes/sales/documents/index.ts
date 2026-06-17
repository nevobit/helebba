import { DocumentType } from '@hlb/contracts';
import { createDocumentRoutes } from './factory';

export const invoiceRoutes = createDocumentRoutes('/invoices', DocumentType.INVOICE);
export const estimateRoutes = createDocumentRoutes('/estimates', DocumentType.ESTIMATE);
export const purchaseRoutes = createDocumentRoutes('/purchases', DocumentType.PURCHASE);
