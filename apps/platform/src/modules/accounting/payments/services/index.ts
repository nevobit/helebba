import { api } from '@/shared/api';
import type { OffsetPaginatedResult, Payment } from '@hlb/contracts';
import type { CreatePaymentPayload, PaymentListParams } from '../types';

export const payments = async (params: PaymentListParams) => {
  const { data } = await api.get<OffsetPaginatedResult<Payment>>('/payments', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim() || undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
    },
  });

  return data;
};

export const payment = async (paymentId: string) => {
  const { data } = await api.get<Payment>(`/payments/${paymentId}`);

  return data;
};

export const createPayment = async (payload: CreatePaymentPayload) => {
  const { data } = await api.post<Payment>('/payments', payload);

  return data;
};

export const updatePayment = async (paymentId: string, payload: CreatePaymentPayload) => {
  const { data } = await api.patch<Payment>(`/payments/${paymentId}`, payload);

  return data;
};

export const deletePayment = async (paymentId: string) => {
  const { data } = await api.delete<Payment>(`/payments/${paymentId}`);

  return data;
};
