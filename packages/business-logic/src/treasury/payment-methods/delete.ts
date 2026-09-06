import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PaymentMethodSchemaMongo,
  type OrganizationId,
  type PaymentMethod,
  type PaymentMethodId,
  type UserId,
} from '@hlb/contracts';

export const deletePaymentMethod = async (
  paymentMethodId: PaymentMethodId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const model = getModel<PaymentMethod>(Collection.PAYMENT_METHODS, PaymentMethodSchemaMongo);
  const paymentMethod = await model.findOne({
    _id: paymentMethodId,
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
  if (!paymentMethod) return null;
  if (paymentMethod.isDefault) {
    throw new Error('The default payment method cannot be deleted');
  }

  return model.findOneAndUpdate(
    { _id: paymentMethodId, organizationId, lifecycleStatus: LifecycleStatus.ACTIVE },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
      },
    },
    { new: true },
  );
};
