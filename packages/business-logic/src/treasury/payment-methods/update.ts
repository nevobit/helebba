import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PaymentMethodSchemaMongo,
  type PaymentMethod,
  type PaymentMethodId,
} from '@hlb/contracts';

export const updatePaymentMethod = async (
  paymentMethodId: PaymentMethodId,
  data: Partial<PaymentMethod>,
): Promise<PaymentMethod | null> => {
  const model = getModel<PaymentMethod>(Collection.PAYMENT_METHODS, PaymentMethodSchemaMongo);

  if (data.isDefault && data.organizationId) {
    await model.updateMany(
      { organizationId: data.organizationId, lifecycleStatus: LifecycleStatus.ACTIVE },
      { $set: { isDefault: false } },
    );
  }

  return model.findOneAndUpdate(
    {
      _id: paymentMethodId,
      organizationId: data.organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
    { $set: data },
    { new: true },
  );
};
