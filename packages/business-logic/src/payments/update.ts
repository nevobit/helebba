import { Collection, getModel } from '@hlb/constant-definitions';
import { PaymentSchemaMongo, type Payment, type PaymentId } from '@hlb/contracts';
import { resolvePaymentAmounts } from './fees';
import { reconcileDocumentPayments } from './reconcile-document';

export const updatePayment = async (paymentId: PaymentId, data: Partial<Payment>) => {
  const model = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const previousPayment = await model.findById(paymentId);
  const currentPayment = previousPayment?.toObject ? previousPayment.toObject() : previousPayment;
  const amounts = await resolvePaymentAmounts({
    ...(currentPayment as Partial<Payment>),
    ...data,
  });
  const result = await model.updateOne(
    { _id: paymentId },
    {
      $set: {
        ...data,
        ...amounts,
        updatedAt: new Date(),
      },
    },
  );

  if (!result.acknowledged && result.matchedCount < 1) throw new Error('Could not update payment');

  const payment = await model.findById(paymentId);

  await reconcileDocumentPayments(previousPayment?.documentId);
  if (payment?.documentId !== previousPayment?.documentId) {
    await reconcileDocumentPayments(payment?.documentId);
  }

  return payment;
};
