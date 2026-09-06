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

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export type CrudApi<T, TCreate = Partial<T>, TUpdate = Partial<T>> = {
  list: (params?: QueryParams) => Promise<OffsetPaginatedResult<T>>;
  get: (id: string) => Promise<T>;
  create: (input: TCreate) => Promise<T>;
  update: (id: string, input: TUpdate) => Promise<T>;
  delete: (id: string) => Promise<T | boolean>;
};

export type ArrayCrudApi<T, TCreate = Partial<T>, TUpdate = Partial<T>> = {
  list: (params?: QueryParams) => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (input: TCreate) => Promise<T>;
  update: (id: string, input: TUpdate) => Promise<T>;
  delete: (id: string) => Promise<T | boolean>;
};

export type CollectionApi<T, TCreate = Partial<T>, TUpdate = Partial<T>> = {
  list: (params?: QueryParams) => Promise<T[]>;
  create: (input: TCreate) => Promise<T>;
  update: (id: string, input: TUpdate) => Promise<T>;
  delete: (id: string) => Promise<T | boolean>;
};

export type HelebbaClientOptions = {
  apiKey: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
};

export type HelebbaClient = {
  products: CrudApi<Product>;
  brands: CrudApi<InventoryBrand>;
  categories: CrudApi<Category>;
  contacts: CrudApi<Contact>;
  warehouses: CrudApi<Warehouse>;
  salesChannels: CrudApi<SalesChannel>;
  expenseAccounts: CrudApi<ExpenseAccount>;
  employees: CrudApi<Employee>;
  services: CrudApi<Service>;
  priceLists: CrudApi<PriceList>;
  paymentMethods: CrudApi<PaymentMethod>;
  payments: CrudApi<Payment>;
  treasuryAccounts: CrudApi<TreasuryAccount>;
  projects: ArrayCrudApi<Project>;
  projectTasks: ArrayCrudApi<ProjectTask>;
  projectTimeEntries: CollectionApi<ProjectTimeEntry>;
  inbox: {
    conversations: ArrayCrudApi<InboxConversation> & {
      list: (params?: InboxConversationFilters) => Promise<InboxConversation[]>;
    };
    listMessages: (conversationId: string) => Promise<InboxMessage[]>;
    sendMessage: (conversationId: string, input: Partial<InboxMessage>) => Promise<InboxMessage>;
    deleteMessage: (conversationId: string, messageId: string) => Promise<boolean>;
    markRead: (conversationId: string) => Promise<boolean>;
  };
  webhooks: {
    list: () => Promise<WebhookSubscription[]>;
    create: (input: Partial<WebhookSubscription>) => Promise<WebhookSubscription>;
    update: (id: string, input: Partial<WebhookSubscription>) => Promise<WebhookSubscription>;
    delete: (id: string) => Promise<boolean>;
    rotateSecret: (id: string) => Promise<{ secret: string }>;
    test: (id: string) => Promise<{ queued: number }>;
    deliveries: (subscriptionId?: string) => Promise<WebhookDelivery[]>;
    retry: (deliveryId: string) => Promise<{ delivered: boolean }>;
  };
  documents: {
    list: (params?: ListDocumentsParams) => Promise<OffsetPaginatedResult<Document>>;
    get: (documentId: string, docType?: DocumentType) => Promise<Document>;
    create: (input: CreateDocumentInput) => Promise<Document>;
    update: (
      documentId: string,
      input: UpdateDocumentInput,
      docType?: DocumentType,
    ) => Promise<Document>;
    delete: (documentId: string, docType?: DocumentType) => Promise<Document>;
    convert: (
      documentId: string,
      input?: ConvertDocumentInput,
      sourceDocType?: DocumentType,
    ) => Promise<Document>;
    sendEmail: (
      documentId: string,
      input: SendDocumentEmailInput,
      docType?: DocumentType,
    ) => Promise<unknown>;
    approve: (documentId: string, docType?: DocumentType) => Promise<Document>;
    accept: (documentId: string, docType?: DocumentType) => Promise<Document>;
    reject: (documentId: string, docType?: DocumentType) => Promise<Document>;
    registerPayment: (
      documentId: string,
      input?: RegisterDocumentPaymentInput,
      docType?: DocumentType,
    ) => Promise<DocumentPaymentResult>;
    downloadPdf: (documentId: string, docType?: DocumentType) => Promise<ArrayBuffer>;
  };
};

export type Contact = Record<string, unknown> & {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

export type Warehouse = Record<string, unknown> & {
  id: string;
  name: string;
  address?: string;
  isDefault?: boolean;
};

export type SalesChannel = Record<string, unknown> & {
  id: string;
  name: string;
  code?: string;
  active?: boolean;
  isDefault?: boolean;
};

export type ExpenseAccount = Record<string, unknown> & {
  id: string;
  name: string;
  code?: string;
  active?: boolean;
  isDefault?: boolean;
};

export type Employee = Record<string, unknown> & {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  status?: string;
};

export type Service = Record<string, unknown> & {
  id: string;
  name: string;
  code?: string;
  price?: number;
  cost?: number;
  archived?: boolean;
};
export type PriceList = Record<string, unknown> & {
  id: string;
  name: string;
  currency?: string;
  description?: string;
};
export type PaymentMethod = Record<string, unknown> & {
  id: string;
  name: string;
  type?: string;
  isDefault?: boolean;
};
export type Payment = Record<string, unknown> & {
  id: string;
  amount?: number;
  currency?: string;
  status?: string;
};
export type TreasuryAccount = Record<string, unknown> & {
  id: string;
  name: string;
  type?: string;
  balance?: number;
};
export type Project = Record<string, unknown> & { id: string; name: string; status?: string };
export type ProjectTask = Record<string, unknown> & {
  id: string;
  projectId: string;
  title: string;
  status?: string;
};
export type ProjectTimeEntry = Record<string, unknown> & {
  id: string;
  projectId: string;
  taskId?: string;
  durationMinutes?: number;
};

export type InboxChannel = 'email' | 'whatsapp' | 'sms' | 'chat' | 'manual' | 'other';
export type InboxConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type InboxMessageDirection = 'inbound' | 'outbound' | 'internal';

export type InboxParticipant = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  type?: 'contact' | 'user' | 'external';
};

export type InboxConversation = Record<string, unknown> & {
  id: string;
  subject: string;
  channel: InboxChannel;
  status: InboxConversationStatus;
  participants: InboxParticipant[];
  contactId?: string;
  assignedTo?: string;
  tags?: string[];
  unreadBy?: string[];
  lastMessageAt?: string;
  lastMessagePreview?: string;
  messageCount?: number;
};

export type InboxMessage = Record<string, unknown> & {
  id: string;
  conversationId: string;
  direction: InboxMessageDirection;
  sender?: InboxParticipant;
  recipients?: InboxParticipant[];
  body: string;
  bodyHtml?: string;
  attachments?: Array<Record<string, unknown>>;
  sentAt: string;
  externalId?: string;
  readBy?: string[];
};

export type InboxConversationFilters = QueryParams & {
  status?: InboxConversationStatus;
  channel?: InboxChannel;
  assignedTo?: string;
  contactId?: string;
  unreadBy?: string;
  search?: string;
};

export type WebhookEventName =
  | 'contact.created'
  | 'contact.updated'
  | 'contact.deleted'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'document.created'
  | 'document.updated'
  | 'document.deleted'
  | 'payment.created'
  | 'payment.updated'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'project.task.created'
  | 'project.task.updated'
  | 'project.task.deleted'
  | 'project.time-entry.created'
  | 'project.time-entry.updated'
  | 'project.time-entry.deleted'
  | 'crm.funnel.created'
  | 'crm.funnel.updated'
  | 'crm.funnel.deleted'
  | 'crm.opportunity.created'
  | 'crm.opportunity.updated'
  | 'crm.opportunity.deleted'
  | 'crm.activity.created'
  | 'crm.activity.updated'
  | 'crm.activity.deleted'
  | 'calendar.event.created'
  | 'calendar.event.updated'
  | 'calendar.event.deleted'
  | 'inbox.conversation.created'
  | 'inbox.conversation.updated'
  | 'inbox.conversation.deleted'
  | 'inbox.message.created'
  | 'inbox.message.deleted';

export type WebhookSubscription = Record<string, unknown> & {
  id: string;
  name: string;
  url: string;
  events: WebhookEventName[];
  active: boolean;
  customHeaders?: Record<string, string>;
  failureCount?: number;
  lastDeliveredAt?: string;
  lastError?: string;
};

export type WebhookDelivery = Record<string, unknown> & {
  id: string;
  subscriptionId: string;
  event: WebhookEventName;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempts: number;
  responseStatus?: number;
  responseBody?: string;
  nextRetryAt?: string;
  deliveredAt?: string;
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

export const DocumentApprovalStatus = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export type DocumentApprovalStatus =
  (typeof DocumentApprovalStatus)[keyof typeof DocumentApprovalStatus];

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
  approvalStatus?: DocumentApprovalStatus;
  approvedAt?: string;
  approvedBy?: string;
  acceptedAt?: string;
  acceptedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
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
  docType?: DocumentType;
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

export type RegisterDocumentPaymentInput = {
  amount?: number;
  bankAccountId?: string;
  paymentMethodId?: string;
  description?: string;
  date?: string;
};

export type DocumentPaymentResult = {
  document: Document;
  payment: Record<string, unknown> & { id: string; amount: number };
};
