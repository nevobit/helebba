import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  LifecycleStatus,
  PaymentMethodSchemaMongo,
  type Document as SalesDocument,
  type DocumentId,
  type OrganizationId,
  type Payment,
  type PaymentMethod,
} from '@hlb/contracts';

const roundMoney = (value: number) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const getEntityId = (entity?: { id?: unknown; _id?: unknown } | null) =>
  entity ? String(entity.id ?? entity._id ?? '') : '';

const calculateFee = (
  grossAmount: number,
  feeType: Payment['feeType'] = 'none',
  feeValue = 0,
) => {
  if (feeType === 'fixed') return roundMoney(Math.max(feeValue, 0));
  if (feeType === 'custom') return roundMoney(Math.max(feeValue, 0));
  if (feeType === 'percentage') return roundMoney(grossAmount * (Math.max(feeValue, 0) / 100));

  return 0;
};

const findPaymentMethod = async (payment: Partial<Payment>) => {
  const lookups = [payment.paymentMethodId, payment.bankAccountId]
    .filter(Boolean)
    .map((lookup) => String(lookup));

  if (!lookups.length || !payment.organizationId) return null;

  const model = getModel<PaymentMethod>(Collection.PAYMENT_METHODS, PaymentMethodSchemaMongo);

  return model.findOne({
    organizationId: payment.organizationId as OrganizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    $or: [
      { _id: { $in: lookups } },
      { bankingAccountId: { $in: lookups } },
    ],
  });
};

const findPaymentDocument = async (payment: Partial<Payment>) => {
  if (!payment.documentId || !payment.organizationId) return null;

  const model = getModel<SalesDocument>(Collection.DOCUMENTS, DocumentSchemaMongo);

  return model.findOne({
    _id: payment.documentId as DocumentId,
    organizationId: payment.organizationId as OrganizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
};

export const resolvePaymentAmounts = async (payment: Partial<Payment>): Promise<Partial<Payment>> => {
  const [paymentMethod, document] = await Promise.all([
    findPaymentMethod(payment),
    findPaymentDocument(payment),
  ]);
  const direction = payment.direction ?? 'inflow';
  const grossAmount = roundMoney(Number(payment.grossAmount ?? payment.amount ?? 0));
  const documentFeeAmount =
    document?.financialFeeValue === undefined ? undefined : Number(document.financialFeeValue ?? 0);
  const feeType = payment.feeType ?? document?.financialFeeType ?? paymentMethod?.financialFeeType ?? 'none';
  const feeValue = Number(payment.feeValue ?? document?.financialFeeValue ?? paymentMethod?.financialFeeValue ?? 0);
  const rawFeeAmount =
    documentFeeAmount !== undefined
      ? roundMoney(Math.max(documentFeeAmount, 0))
      : calculateFee(grossAmount, feeType, feeValue);
  const feeAmount = roundMoney(direction === 'inflow' ? Math.min(rawFeeAmount, grossAmount) : rawFeeAmount);
  const netAmount = roundMoney(
    direction === 'inflow' ? Math.max(grossAmount - feeAmount, 0) : grossAmount + feeAmount,
  );
  const paymentMethodId = paymentMethod ? getEntityId(paymentMethod) : payment.paymentMethodId;

  return {
    amount: grossAmount,
    direction,
    grossAmount,
    feeAmount,
    netAmount,
    financialFeePaymentMethodId: payment.financialFeePaymentMethodId,
    feeName: payment.feeName,
    feeType,
    feeValue: feeType === 'none' ? 0 : feeValue,
    paymentMethodId,
  };
};
