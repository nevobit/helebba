export type OffsetPageInfo = {
  page: number;
  pages: number;
  pageSize: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousPage: number | null;
  nextPage: number | null;
};

export type OffsetPaginatedResult<T> = {
  kind: 'offset';
  count: number;
  items: T[];
  pageInfo: OffsetPageInfo;
};

export type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type HelebbaClientOptions = {
  apiKey: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
};

export type HelebbaClient = {
  products: {
    list: (params?: ListParams) => Promise<OffsetPaginatedResult<Product>>;
    get: (productId: string) => Promise<Product>;
  };
  brands: {
    list: (params?: ListParams) => Promise<OffsetPaginatedResult<InventoryBrand>>;
  };
  categories: {
    list: (params?: ListParams) => Promise<OffsetPaginatedResult<Category>>;
  };
  documents: {
    list: (params?: ListDocumentsParams) => Promise<OffsetPaginatedResult<Document>>;
    get: (documentId: string) => Promise<Document>;
    create: (input: CreateDocumentInput) => Promise<Document>;
    update: (documentId: string, input: UpdateDocumentInput) => Promise<Document>;
    delete: (documentId: string) => Promise<Document>;
    convert: (documentId: string, input?: ConvertDocumentInput) => Promise<Document>;
    sendEmail: (documentId: string, input: SendDocumentEmailInput) => Promise<unknown>;
  };
};

export type Product = Record<string, unknown> & {
  id: string;
  name: string;
  sku?: string;
  description?: string;
};

export type InventoryBrand = Record<string, unknown> & {
  id: string;
  name: string;
  description?: string;
};

export type Category = Record<string, unknown> & {
  id: string;
  name: string;
  description?: string;
};

// ── Document types ──────────────────────────────────────────────────────────

export const DocumentType = {
  INVOICE: 'invoice',
  SALES_RECEIPT: 'sales-receipt',
  CREDIT_NOTE: 'credit-note',
  RECEIPT_NOTE: 'receipt-note',
  ESTIMATE: 'estimate',
  SALES_ORDER: 'sales-order',
  WAYBILL: 'waybill',
  PROFORM: 'proform',
  PURCHASE: 'purchase',
  PURCHASE_REFUND: 'purchase-refund',
  PURCHASE_ORDER: 'purchase-order',
  REFERRALS: 'referrals',
  QUOTES: 'quotes',
  EXPENSES: 'expenses',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const StatusDocument = {
  Pending: 0,
  Paid: 1,
  PartiallyPaid: 2,
  Cancelled: 3,
} as const;

export type StatusDocument = (typeof StatusDocument)[keyof typeof StatusDocument];

export type ProductDocument = {
  id: string;
  concept: string;
  description: string;
  price: number;
  units: number;
  discount?: number;
  tax: number;
  taxes: string[];
  tags: string[];
  productId: string;
  variantId: string;
  serviceId: string;
  sku?: string;
  weight?: number;
  costPrice?: number;
  account: string;
  projectId: string;
  retention: string;
  unitType: string;
};

export type DocumentCustomField = {
  field: string;
  value: string;
};

export type Document = Record<string, unknown> & {
  id: string;
  contactId: string;
  contactName: string;
  description: string;
  date: string;
  dueDate: string;
  disbursementDate?: string;
  subtotal: number;
  discount: number;
  total: number;
  tax: number;
  currency: string;
  status: StatusDocument;
  tags: string[];
  lines: Partial<ProductDocument>[];
  paymentMethodId: string;
  financialFeePaymentMethodId?: string;
  financialFeeName?: string;
  financialFeeType?: string;
  financialFeeValue?: number;
  paymentsTotal: number;
  paymentsPending: number;
  language: string;
  designId: string;
  docType: DocumentType | string;
  customFields: DocumentCustomField[];
  docNumber: string;
  createdAt?: string;
  updatedAt?: string;
};

// ── Document input types ────────────────────────────────────────────────────

export type CreateDocumentInput = {
  docType?: DocumentType;
  contactId: string;
  contactName?: string;
  description?: string;
  date?: string;
  dueDate?: string;
  paymentMethodId?: string;
  currency?: string;
  tags?: string[];
  lines?: Partial<ProductDocument>[];
  customFields?: DocumentCustomField[];
  status?: StatusDocument;
};

export type UpdateDocumentInput = {
  contactId?: string;
  contactName?: string;
  description?: string;
  date?: string;
  dueDate?: string;
  paymentMethodId?: string;
  currency?: string;
  tags?: string[];
  lines?: Partial<ProductDocument>[];
  customFields?: DocumentCustomField[];
  status?: StatusDocument;
};

export type ListDocumentsParams = ListParams & {
  docType?: DocumentType | string;
  contactId?: string;
  paymentMethodId?: string;
};

export type ConvertDocumentInput = {
  docType: DocumentType;
};

export type SendDocumentEmailInput = {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  message?: string;
};
