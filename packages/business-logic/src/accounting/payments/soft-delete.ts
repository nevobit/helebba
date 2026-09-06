import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, PaymentSchemaMongo, type Payment, type PaymentId } from '@hlb/contracts';
import { reconcileDocumentPayments } from './reconcile-document';

export const softDeletePayment = async (paymentId: PaymentId, organizationId: string) => {
  const model = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const payment = await model.findOne({ _id: paymentId, organizationId });
  const result = await model.updateOne(
    { _id: paymentId, organizationId },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );

  if (!result.acknowledged && result.matchedCount < 1) throw new Error('Could not delete payment');

  await reconcileDocumentPayments(payment?.documentId, organizationId);

  return model.findById(paymentId);
};
