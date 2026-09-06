import { createHttpClient } from './http';
import {
  DocumentType,
  type Category,
  type Contact,
  type ConvertDocumentInput,
  type CreateDocumentInput,
  type Document,
  type HelebbaClient,
  type HelebbaClientOptions,
  type InventoryBrand,
  type Employee,
  type ExpenseAccount,
  type ListDocumentsParams,
  type OffsetPaginatedResult,
  type Product,
  type SalesChannel,
  type SendDocumentEmailInput,
  type UpdateDocumentInput,
  type Warehouse,
  type Service,
  type PriceList,
  type PaymentMethod,
  type Payment,
  type TreasuryAccount,
  type Project,
  type ProjectTask,
  type ProjectTimeEntry,
  type InboxConversation,
  type InboxMessage,
  type WebhookDelivery,
  type WebhookSubscription,
} from './types';

const createCrudApi = <T>(http: ReturnType<typeof createHttpClient>, path: string) => ({
  list: (params = {}) => http.get<OffsetPaginatedResult<T>>(path, { query: params }),
  get: (id: string) => http.get<T>(`${path}/${encodeURIComponent(id)}`),
  create: (input: Partial<T>) => http.post<T>(path, input),
  update: (id: string, input: Partial<T>) =>
    http.patch<T>(`${path}/${encodeURIComponent(id)}`, input),
  delete: (id: string) => http.delete<T | boolean>(`${path}/${encodeURIComponent(id)}`),
});

const createArrayCrudApi = <T>(http: ReturnType<typeof createHttpClient>, path: string) => ({
  list: (params = {}) => http.get<T[]>(path, { query: params }),
  get: (id: string) => http.get<T>(`${path}/${encodeURIComponent(id)}`),
  create: (input: Partial<T>) => http.post<T>(path, input),
  update: (id: string, input: Partial<T>) =>
    http.patch<T>(`${path}/${encodeURIComponent(id)}`, input),
  delete: (id: string) => http.delete<T | boolean>(`${path}/${encodeURIComponent(id)}`),
});

const createArrayCollectionApi = <T>(http: ReturnType<typeof createHttpClient>, path: string) => ({
  list: (params = {}) => http.get<T[]>(path, { query: params }),
  create: (input: Partial<T>) => http.post<T>(path, input),
  update: (id: string, input: Partial<T>) =>
    http.patch<T>(`${path}/${encodeURIComponent(id)}`, input),
  delete: (id: string) => http.delete<T | boolean>(`${path}/${encodeURIComponent(id)}`),
});

const DOCUMENT_PATHS: Record<string, string> = {
  [DocumentType.INVOICE]: '/invoices',
  [DocumentType.SALES_RECEIPT]: '/sales-receipts',
  [DocumentType.CREDIT_NOTE]: '/credit-notes',
  [DocumentType.RECEIPT_NOTE]: '/receipt-notes',
  [DocumentType.ESTIMATE]: '/estimates',
  [DocumentType.SALES_ORDER]: '/sales-orders',
  [DocumentType.WAYBILL]: '/waybills',
  [DocumentType.PROFORM]: '/proformas',
  [DocumentType.PURCHASE]: '/purchases',
  [DocumentType.PURCHASE_REFUND]: '/purchase-refunds',
  [DocumentType.PURCHASE_ORDER]: '/purchase-orders',
  [DocumentType.REFERRALS]: '/purchase-shipments',
  [DocumentType.QUOTES]: '/quotes',
  [DocumentType.EXPENSES]: '/expenses',
};

const resolveDocPath = (docType: string = DocumentType.INVOICE): string => {
  const path = DOCUMENT_PATHS[docType];
  if (!path) throw new Error(`Unsupported document type: ${docType}`);
  return path;
};

const documentPath = (documentId: string, docType?: string) =>
  `${resolveDocPath(docType)}/${encodeURIComponent(documentId)}`;

export const createHelebbaClient = (options: HelebbaClientOptions): HelebbaClient => {
  const http = createHttpClient(options);

  return {
    products: createCrudApi<Product>(http, '/products'),
    brands: createCrudApi<InventoryBrand>(http, '/brands'),
    categories: createCrudApi<Category>(http, '/categories'),
    contacts: createCrudApi<Contact>(http, '/contacts'),
    warehouses: createCrudApi<Warehouse>(http, '/warehouses'),
    salesChannels: createCrudApi<SalesChannel>(http, '/sales-channels'),
    expenseAccounts: createCrudApi<ExpenseAccount>(http, '/expense-accounts'),
    employees: createCrudApi<Employee>(http, '/employees'),
    services: createCrudApi<Service>(http, '/services'),
    priceLists: createCrudApi<PriceList>(http, '/price-lists'),
    paymentMethods: createCrudApi<PaymentMethod>(http, '/payment-methods'),
    payments: createCrudApi<Payment>(http, '/payments'),
    treasuryAccounts: {
      ...createCrudApi<TreasuryAccount>(http, '/treasury/accounts'),
      update: (id, input) =>
        http.put<TreasuryAccount>(`/treasury/accounts/${encodeURIComponent(id)}`, input),
    },
    projects: createArrayCrudApi<Project>(http, '/projects'),
    projectTasks: createArrayCrudApi<ProjectTask>(http, '/project-tasks'),
    projectTimeEntries: createArrayCollectionApi<ProjectTimeEntry>(http, '/project-time-entries'),
    inbox: {
      conversations: createArrayCrudApi<InboxConversation>(http, '/inbox/conversations'),
      listMessages: (conversationId) =>
        http.get<InboxMessage[]>(
          `/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,
        ),
      sendMessage: (conversationId, input) =>
        http.post<InboxMessage>(
          `/inbox/conversations/${encodeURIComponent(conversationId)}/messages`,
          input,
        ),
      deleteMessage: (conversationId, messageId) =>
        http.delete<boolean>(
          `/inbox/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
        ),
      markRead: (conversationId) =>
        http.post<boolean>(`/inbox/conversations/${encodeURIComponent(conversationId)}/read`),
    },
    webhooks: {
      list: () => http.get<WebhookSubscription[]>('/developers/webhooks'),
      create: (input) => http.post<WebhookSubscription>('/developers/webhooks', input),
      update: (id, input) =>
        http.patch<WebhookSubscription>(`/developers/webhooks/${encodeURIComponent(id)}`, input),
      delete: (id) => http.delete<boolean>(`/developers/webhooks/${encodeURIComponent(id)}`),
      rotateSecret: (id) =>
        http.post<{ secret: string }>(
          `/developers/webhooks/${encodeURIComponent(id)}/rotate-secret`,
        ),
      test: (id) =>
        http.post<{ queued: number }>(`/developers/webhooks/${encodeURIComponent(id)}/test`),
      deliveries: (subscriptionId) =>
        http.get<WebhookDelivery[]>('/developers/webhooks/deliveries', {
          query: { subscriptionId },
        }),
      retry: (deliveryId) =>
        http.post<{ delivered: boolean }>(
          `/developers/webhooks/deliveries/${encodeURIComponent(deliveryId)}/retry`,
        ),
    },
    documents: {
      list: (params = {}) => {
        const { docType, ...rest } = params;
        const path = resolveDocPath(docType);
        return http.get<OffsetPaginatedResult<Document>>(path, { query: rest });
      },
      get: (documentId, docType) => http.get<Document>(documentPath(documentId, docType)),
      create: (input) => {
        const docType = input.docType ?? 'invoice';
        const path = resolveDocPath(docType);
        return http.post<Document>(path, input);
      },
      update: (documentId, input, docType) =>
        http.patch<Document>(documentPath(documentId, docType ?? input.docType), input),
      delete: (documentId, docType) => http.delete<Document>(documentPath(documentId, docType)),
      convert: (documentId, input, sourceDocType) => {
        const path = `${documentPath(documentId, sourceDocType)}/convert`;
        return http.post<Document>(path, input ?? {});
      },
      sendEmail: (documentId, input, docType) => {
        const path = `${documentPath(documentId, docType)}/send-email`;
        return http.post<unknown>(path, input);
      },
      approve: (documentId, docType) =>
        http.post<Document>(`${documentPath(documentId, docType)}/approve`),
      accept: (documentId, docType) =>
        http.post<Document>(`${documentPath(documentId, docType)}/accept`),
      reject: (documentId, docType) =>
        http.post<Document>(`${documentPath(documentId, docType)}/reject`),
      registerPayment: (documentId, input = {}, docType) =>
        http.post(`${documentPath(documentId, docType)}/payment`, input),
      downloadPdf: (documentId, docType) =>
        http.getBinary(`${documentPath(documentId, docType)}/pdf`),
    },
  };
};
