import type { Document, OffsetPageInfo, OffsetPaginatedResult, ProductDocument } from '@hlb/contracts';

export type DocumentKind = 'invoice' | 'estimate' | 'purchase';

export type DocumentListParams = {
  page: number;
  limit: number;
  paymentMethodId?: string;
  search?: string;
};

export type DocumentsResponse = OffsetPaginatedResult<Document>;

export type DocumentRow = {
  id: string;
  date: string;
  docNumber: string;
  operationDate: string;
  dueDate: string;
  contactName: string;
  description: string;
  tags: string;
  account: string;
  paymentMethod: string;
  project: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  statusTone: 'warning' | 'success' | 'danger' | 'neutral';
  source: Document;
};

export type DocumentConfig = {
  kind: DocumentKind;
  title: string;
  singularTitle: string;
  newLabel: string;
  importLabel: string;
  emptyTitle: string;
  emptyButton: string;
  emptyArticle: string;
  listPath: string;
  newPath: string;
  endpoint: string;
  nextConvertLabel: string;
};

export type DocumentLineForm = {
  id: string;
  itemType?: 'product' | 'service';
  productId?: string;
  serviceId?: string;
  sku?: string;
  concept: string;
  description: string;
  quantity: string;
  price: string;
  tax: string;
};

export type CreateDocumentPayload = Partial<
  Pick<
    Document,
    | 'contactId'
    | 'contactName'
    | 'description'
    | 'date'
    | 'dueDate'
    | 'disbursementDate'
    | 'subtotal'
    | 'discount'
    | 'tax'
    | 'total'
    | 'currency'
    | 'tags'
    | 'lines'
    | 'financialFeePaymentMethodId'
    | 'financialFeeName'
    | 'financialFeeType'
    | 'financialFeeValue'
    | 'paymentMethodId'
    | 'paymentsTotal'
    | 'paymentsPending'
    | 'language'
    | 'docNumber'
  >
> & {
  lines?: Partial<ProductDocument>[];
};

export type SendDocumentEmailPayload = {
  bcc?: string;
  cc?: string;
  message?: string;
  subject?: string;
  to?: string;
};

export type SendDocumentEmailResponse = {
  bcc: string[];
  cc: string[];
  id: string;
  subject: string;
  to: string[];
};

export type DocumentsListState = {
  rows: DocumentRow[];
  pageInfo?: OffsetPageInfo;
  total: number;
};
