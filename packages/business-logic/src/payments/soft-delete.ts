import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, PaymentSchemaMongo, type Payment, type PaymentId } from '@hlb/contracts';
import { reconcileDocumentPayments } from './reconcile-document';

export const softDeletePayment = async (paymentId: PaymentId) => {
  const model = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const payment = await model.findById(paymentId);
  const result = await model.updateOne(
    { _id: paymentId },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );

  if (!result.acknowledged && result.matchedCount < 1) throw new Error('Could not delete payment');

  await reconcileDocumentPayments(payment?.documentId);

  return model.findById(paymentId);
};
