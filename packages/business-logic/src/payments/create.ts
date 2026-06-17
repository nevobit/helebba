import { Collection, getModel } from '@hlb/constant-definitions';
import { PaymentSchemaMongo, type Payment } from '@hlb/contracts';
import { resolvePaymentAmounts } from './fees';
import { reconcileDocumentPayments } from './reconcile-document';

export const createPayment = async (data: Partial<Payment>): Promise<Payment> => {
  const model = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const hasDocument = Boolean(data.documentId);
  const amounts = await resolvePaymentAmounts(data);
  const payment = new model({
    ...data,
    ...amounts,
    status: data.status ?? (hasDocument ? 'assigned' : 'unassigned'),
    reconciliationStatus: data.reconciliationStatus ?? 'pending',
    totalDocuments: data.totalDocuments ?? (hasDocument ? 1 : 0),
    totalTransactions: data.totalTransactions ?? 0,
    totalAdvance: data.totalAdvance ?? 0,
  });
  const createdPayment = await payment.save();

  await reconcileDocumentPayments(createdPayment.documentId);

  return createdPayment;
};
