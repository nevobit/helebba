import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PaymentMethodSchemaMongo,
  type OrganizationId,
  type PaymentMethod,
  type UserId,
} from '@hlb/contracts';

export const defaultPaymentMethods: Partial<PaymentMethod>[] = [
  {
    name: 'Transferencia bancaria',
    type: 'bank_transfer',
    status: 'active',
    isDefault: true,
    dueDays: 15,
    settlementMode: 'deferred',
    disbursementRule: 'days_after_issue',
    disbursementDays: 15,
    metadata: {
      documentText:
        'Pagar por transferencia bancaria al siguiente número de cuenta Cambialo en Configuración > Formas de pago',
    },
  },
  {
    name: 'Efectivo',
    type: 'cash',
    status: 'active',
    isDefault: false,
    dueDays: 0,
    settlementMode: 'instant',
    disbursementRule: 'immediate',
    metadata: {
      documentText: 'Pago en efectivo',
    },
  },
];

type SeedDefaultPaymentMethodsInput = {
  organizationId: OrganizationId;
  userId: UserId;
};

export const seedDefaultPaymentMethods = async ({
  organizationId,
  userId,
}: SeedDefaultPaymentMethodsInput) => {
  const model = getModel<PaymentMethod>(Collection.PAYMENT_METHODS, PaymentMethodSchemaMongo);
  const count = await model.countDocuments({
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (count > 0) return;

  await model.insertMany(
    defaultPaymentMethods.map((paymentMethod) => ({
      ...paymentMethod,
      organizationId,
      createdBy: userId,
      updatedBy: userId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
      deletedAt: null,
    })),
  );
};
