import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, PaymentMethodSchemaMongo, type PaymentMethod } from '@hlb/contracts';

export const createPaymentMethod = async (data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
  const model = getModel<PaymentMethod>(Collection.PAYMENT_METHODS, PaymentMethodSchemaMongo);
  const isDefault = Boolean(data.isDefault);

  if (isDefault && data.organizationId) {
    await model.updateMany(
      { organizationId: data.organizationId, lifecycleStatus: LifecycleStatus.ACTIVE },
      { $set: { isDefault: false } },
    );
  }

  const paymentMethod = new model({
    ...data,
    type: data.type ?? 'bank_transfer',
    status: data.status ?? 'active',
    isDefault,
    dueDays: data.dueDays ?? 0,
    settlementMode: data.settlementMode ?? 'deferred',
    disbursementRule:
      data.disbursementRule ?? (data.settlementMode === 'instant' ? 'immediate' : 'days_after_issue'),
    disbursementDays: data.disbursementDays,
    disbursementDayOfMonth: data.disbursementDayOfMonth,
    lifecycleStatus: data.lifecycleStatus ?? LifecycleStatus.ACTIVE,
  });

  return paymentMethod.save();
};
