import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PaymentMethodSchemaMongo,
  type OrganizationId,
  type PaymentMethod,
  type PaymentMethodId,
} from '@hlb/contracts';

export const getPaymentMethodById = async (
  paymentMethodId: PaymentMethodId,
  organizationId: OrganizationId,
) => {
  const model = getModel<PaymentMethod>(Collection.PAYMENT_METHODS, PaymentMethodSchemaMongo);
  return model.findOne({
    _id: paymentMethodId,
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
};
