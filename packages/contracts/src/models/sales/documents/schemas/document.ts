import type {
  ContactId,
  DocumentId,
  PaymentMethodId,
  ISODateTimeString,
  PersistedSoftDeletableEntity,
  ProductId,
  ServiceId,
  UserId,
  NumberingSeriesId,
} from '../../../../common';
import type { FinancialFeeType } from '../../../treasury';

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

export interface ProductDocument {
  id: string;
  concept: string;
  description: string;
  price: number;
  units: number;
  discount?: number;
  tax: number;
  taxes: string[];
  tags: string[];
  productId: ProductId;
  variantId: string;
  serviceId: ServiceId;
  sku?: string;
  weight?: number;
  costPrice?: number;
  account: string;
  projectId: string;
  retention: string;
  unitType: string;
}

export interface DocumentTracking {
  key?: string;
  name?: string;
  num?: string;
  pickUpDate?: ISODateTimeString;
  deliveryDate?: ISODateTimeString;
  notes?: string;
}

export interface DocumentFulfilledLine {
  lineIndex: number;
  productId?: ProductId;
  variantId?: string;
  sku?: string;
  units: number;
  fulfilledAt: ISODateTimeString;
  warehouseId?: string;
}

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

export interface Document extends PersistedSoftDeletableEntity<DocumentId, UserId> {
  contactId: ContactId;
  contactName: string;
  description: string;
  date: ISODateTimeString;
  dueDate: ISODateTimeString;
  disbursementDate?: ISODateTimeString;
  subtotal: number;
  discount: number;
  total: number;
  tax: number;
  currency: string;
  status: StatusDocument;
  approvalStatus?: DocumentApprovalStatus;
  approvedAt?: ISODateTimeString;
  approvedBy?: UserId;
  acceptedAt?: ISODateTimeString;
  acceptedBy?: UserId;
  rejectedAt?: ISODateTimeString;
  rejectedBy?: UserId;
  tags: string[];
  lines: Partial<ProductDocument>[];
  paymentMethodId: string;
  financialFeePaymentMethodId?: PaymentMethodId | string;
  financialFeeName?: string;
  financialFeeType?: FinancialFeeType;
  financialFeeValue?: number;
  paymentsTotal: number;
  paymentsPending: number;
  language: string;
  designId: string;
  docType: DocumentType | string;
  customFields: DocumentCustomField[];
  docNumber: string;
  numberingSeriesId?: NumberingSeriesId;
  recurringDocumentId?: string;
  attachments: DocumentAttachment[];
  pipelineId?: string;
  pipelineStageId?: string;
  tracking?: DocumentTracking;
  fulfilledLines?: DocumentFulfilledLine[];
}

export interface DocumentCustomField {
  field: string;
  value: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  url: string;
  contentType?: string;
  size?: number;
  createdAt: ISODateTimeString;
  createdBy: UserId;
}
