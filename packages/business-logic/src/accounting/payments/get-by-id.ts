import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PaymentSchemaMongo,
  type OrganizationId,
  type Payment,
  type PaymentId,
} from '@hlb/contracts';

export const getPaymentById = async (paymentId: PaymentId, organizationId?: OrganizationId) => {
  const model = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const payment = await model.findOne({
    _id: paymentId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    ...(organizationId ? { organizationId } : {}),
  });

  return payment;
};
