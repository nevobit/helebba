import { Collection, getModel } from '@hlb/constant-definitions';
import { PaymentSchemaMongo, type Payment, type PaymentId } from '@hlb/contracts';
import { resolvePaymentAmounts } from './fees';
import { reconcileDocumentPayments } from './reconcile-document';

export const updatePayment = async (paymentId: PaymentId, data: Partial<Payment>, organizationId: string) => {
  const model = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const previousPayment = await model.findOne({ _id: paymentId, organizationId });
  const currentPayment = previousPayment?.toObject ? previousPayment.toObject() : previousPayment;
  const amounts = await resolvePaymentAmounts({
    ...(currentPayment as Partial<Payment>),
    ...data,
  });
  const result = await model.updateOne(
    { _id: paymentId, organizationId },
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

  await reconcileDocumentPayments(previousPayment?.documentId, organizationId);
  if (payment?.documentId !== previousPayment?.documentId) {
    await reconcileDocumentPayments(payment?.documentId, organizationId);
  }

  return payment;
};
