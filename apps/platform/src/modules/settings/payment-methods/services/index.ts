import { api } from '@/shared/api';
import type { OffsetPaginatedResult, PaymentMethod } from '@hlb/contracts';

export type PaymentMethodListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type CreatePaymentMethodPayload = Partial<
  Pick<
    PaymentMethod,
    | 'bankingAccountId'
    | 'connectionId'
    | 'dueDays'
    | 'disbursementDayOfMonth'
    | 'disbursementDays'
    | 'disbursementRule'
    | 'financialFeeType'
    | 'financialFeeValue'
    | 'isDefault'
    | 'maxInstallments'
    | 'metadata'
    | 'minInstallments'
    | 'name'
    | 'requiresApprovalReference'
    | 'requiresDeliveryConfirmation'
    | 'settlementMode'
    | 'status'
    | 'supportsInstallments'
    | 'type'
  >
>;

export type UpdatePaymentMethodPayload = CreatePaymentMethodPayload;

export const paymentMethods = async (params: PaymentMethodListParams = {}) => {
  const { data } = await api.get<OffsetPaginatedResult<PaymentMethod>>('/payment-methods', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      search: params.search?.trim() || undefined,
    },
  });

  return data;
};

export const createPaymentMethod = async (payload: CreatePaymentMethodPayload) => {
  const { data } = await api.post<PaymentMethod>('/payment-methods', payload);

  return data;
};

export const updatePaymentMethod = async (paymentMethodId: string, payload: UpdatePaymentMethodPayload) => {
  const { data } = await api.patch<PaymentMethod>(`/payment-methods/${paymentMethodId}`, payload);

  return data;
};
