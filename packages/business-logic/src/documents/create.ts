import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  LifecycleStatus,
  PaymentMethodSchemaMongo,
  StatusDocument,
  type Document as SalesDocument,
  type DocumentType,
  type PaymentMethod,
} from '@hlb/contracts';
import { createPayment } from '../payments/create';
import { buildDocumentNumber, calculateDocumentTotals } from './utils';

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const nextDayOfMonth = (date: Date, dayOfMonth: number) => {
  const day = Math.min(Math.max(dayOfMonth, 1), 31);
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(date.getMonth() + (date.getDate() >= day ? 1 : 0));
  next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  return next;
};

const resolveDisbursementDate = (
  data: Partial<SalesDocument>,
  paymentMethod: PaymentMethod | null,
) => {
  if (data.disbursementDate) return data.disbursementDate;

  const baseDate = new Date(data.date ?? new Date().toISOString());
  if (Number.isNaN(baseDate.getTime())) return undefined;

  if (!paymentMethod) return undefined;

  if (paymentMethod.disbursementRule === 'immediate' || paymentMethod.settlementMode === 'instant') {
    return baseDate.toISOString();
  }

  if (paymentMethod.disbursementRule === 'days_after_issue') {
    return addDays(baseDate, paymentMethod.disbursementDays ?? paymentMethod.dueDays ?? 0).toISOString();
  }

  if (paymentMethod.disbursementRule === 'day_of_month') {
    return nextDayOfMonth(baseDate, paymentMethod.disbursementDayOfMonth ?? 1).toISOString();
  }

  return undefined;
};

const resolvePaymentDirection = (docType: DocumentType) =>
  docType === 'purchase' || docType === 'expenses' ? 'outflow' : 'inflow';

const getPaymentMethodId = (paymentMethod: PaymentMethod | null) =>
  paymentMethod ? String(paymentMethod.id ?? paymentMethod._id ?? '') : undefined;

const roundMoney = (value: number) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const resolveFeeAmount = (total: number, feeType: string, feeValue: number) => {
  const value = Math.max(Number(feeValue ?? 0), 0);

  if (feeType === 'fixed' || feeType === 'custom') return roundMoney(value);
  if (feeType === 'percentage') return roundMoney(Number(total ?? 0) * (value / 100));

  return 0;
};

const resolveFinancialFee = (
  data: Partial<SalesDocument>,
  paymentMethod: PaymentMethod | null,
  financialFeeMethod: PaymentMethod | null,
  total: number,
) => {
  const source = financialFeeMethod ?? paymentMethod;
  const feeType = data.financialFeeType ?? source?.financialFeeType ?? 'none';
  const configuredFeeValue = data.financialFeeValue ?? source?.financialFeeValue ?? 0;
  const feeAmount =
    feeType === 'none' ? 0 : resolveFeeAmount(total, feeType, Number(configuredFeeValue ?? 0));

  return {
    financialFeePaymentMethodId: data.financialFeePaymentMethodId ?? getPaymentMethodId(source),
    feeName: data.financialFeeName ?? financialFeeMethod?.name ?? paymentMethod?.name,
    feeType,
    feeValue: feeAmount,
  };
};

export const createDocument = async (
  data: Partial<SalesDocument>,
  docType: DocumentType,
): Promise<SalesDocument> => {
  const model = getModel<SalesDocument>(Collection.DOCUMENTS, DocumentSchemaMongo);
  const paymentMethodModel = getModel<PaymentMethod>(Collection.PAYMENT_METHODS, PaymentMethodSchemaMongo);
  const totals = calculateDocumentTotals(data);
  const paymentMethod = data.paymentMethodId
    ? await paymentMethodModel.findOne({
        _id: data.paymentMethodId,
        organizationId: data.organizationId,
        lifecycleStatus: LifecycleStatus.ACTIVE,
      })
    : null;
  const financialFeeMethod = data.financialFeePaymentMethodId
    ? await paymentMethodModel.findOne({
        _id: data.financialFeePaymentMethodId,
        organizationId: data.organizationId,
        lifecycleStatus: LifecycleStatus.ACTIVE,
      })
    : null;
  const shouldCreateAutomaticPayment =
    paymentMethod?.settlementMode === 'instant' || paymentMethod?.disbursementRule === 'immediate';
  const paymentsTotal = data.paymentsTotal ?? 0;
  const paymentsPending = data.paymentsPending ?? Math.max(totals.total - paymentsTotal, 0);
  const disbursementDate = resolveDisbursementDate(data, paymentMethod);
  const financialFee = resolveFinancialFee(data, paymentMethod, financialFeeMethod, totals.total);
  const document = new model({
    ...data,
    ...totals,
    docType,
    disbursementDate,
    financialFeePaymentMethodId: financialFee.financialFeePaymentMethodId,
    financialFeeName: financialFee.feeName,
    financialFeeType: financialFee.feeType,
    financialFeeValue: financialFee.feeValue,
    status: data.status ?? (paymentsPending <= 0 && paymentsTotal > 0 ? StatusDocument.Paid : StatusDocument.Pending),
    currency: data.currency ?? 'COP',
    paymentsTotal,
    paymentsPending,
    tags: data.tags ?? [],
    lines: data.lines ?? [],
    customFields: data.customFields ?? [],
    docNumber: data.docNumber || buildDocumentNumber(docType),
  });
  const createdDocument = await document.save();

  if (!shouldCreateAutomaticPayment || totals.total <= 0) {
    return createdDocument;
  }

  await createPayment({
    organizationId: data.organizationId,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    bankAccountId: paymentMethod?.bankingAccountId ?? data.paymentMethodId ?? '',
    paymentMethodId: data.paymentMethodId,
    ...financialFee,
    contactId: data.contactId,
    contactName: data.contactName,
    amount: totals.total,
    direction: resolvePaymentDirection(docType),
    description: `${createdDocument.docNumber || 'Documento'} ${data.contactName || ''}`.trim(),
    date: disbursementDate ?? data.date ?? new Date().toISOString(),
    status: 'assigned',
    reconciliationStatus: 'pending',
    totalDocuments: 1,
    totalTransactions: 0,
    totalAdvance: 0,
    documentType: docType,
    documentId: String(createdDocument.id ?? createdDocument._id),
  });

  const reconciledDocument = await model.findById(createdDocument.id ?? createdDocument._id);

  return reconciledDocument ?? createdDocument;
};
