import { createHttpClient } from './http';
import {
  DocumentType,
  type Category,
  type ConvertDocumentInput,
  type CreateDocumentInput,
  type Document,
  type HelebbaClient,
  type HelebbaClientOptions,
  type InventoryBrand,
  type ListDocumentsParams,
  type OffsetPaginatedResult,
  type Product,
  type SendDocumentEmailInput,
  type UpdateDocumentInput,
} from './types';

const DOCUMENT_PATHS: Record<string, string> = {
  [DocumentType.INVOICE]: '/invoices',
  [DocumentType.SALES_ORDER]: '/invoices',
  [DocumentType.CREDIT_NOTE]: '/invoices',
  [DocumentType.ESTIMATE]: '/estimates',
  [DocumentType.PURCHASE]: '/purchases',
  [DocumentType.PURCHASE_ORDER]: '/purchase-orders',
};

const resolveDocPath = (docType?: string): string =>
  docType ? (DOCUMENT_PATHS[docType] ?? '/invoices') : '/invoices';

export const createHelebbaClient = (options: HelebbaClientOptions): HelebbaClient => {
  const http = createHttpClient(options);

  return {
    products: {
      list: (params = {}) =>
        http.get<OffsetPaginatedResult<Product>>('/products', { query: params }),
      get: (productId) => http.get<Product>(`/products/${encodeURIComponent(productId)}`),
    },
    brands: {
      list: (params = {}) =>
        http.get<OffsetPaginatedResult<InventoryBrand>>('/brands', { query: params }),
    },
    categories: {
      list: (params = {}) =>
        http.get<OffsetPaginatedResult<Category>>('/categories', { query: params }),
    },
    documents: {
      list: (params = {}) => {
        const { docType, ...rest } = params;
        const path = resolveDocPath(docType);
        return http.get<OffsetPaginatedResult<Document>>(path, { query: rest });
      },
      get: (documentId) => {
        const path = `/invoices/${encodeURIComponent(documentId)}`;
        return http.get<Document>(path);
      },
      create: (input) => {
        const docType = input.docType ?? 'invoice';
        const path = resolveDocPath(docType);
        return http.post<Document>(path, input);
      },
      update: (documentId, input) => {
        const path = `/invoices/${encodeURIComponent(documentId)}`;
        return http.patch<Document>(path, input);
      },
      delete: (documentId) => {
        const path = `/invoices/${encodeURIComponent(documentId)}`;
        return http.delete<Document>(path);
      },
      convert: (documentId, input) => {
        const path = `/invoices/${encodeURIComponent(documentId)}/convert`;
        return http.post<Document>(path, input ?? {});
      },
      sendEmail: (documentId, input) => {
        const path = `/invoices/${encodeURIComponent(documentId)}/send-email`;
        return http.post<unknown>(path, input);
      },
    },
  };
};
