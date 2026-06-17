import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPayment, deletePayment, payment, payments, updatePayment } from '../services';
import { toPaymentRow } from '../mappers';
import type { CreatePaymentPayload, PaymentListParams } from '../types';

export const paymentsQueryKey = (params?: Partial<PaymentListParams>) => ['payments', params];

export const usePayments = (params: PaymentListParams) => {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: paymentsQueryKey(params),
    queryFn: () => payments(params),
  });

  return {
    payments: data?.items ?? [],
    pageInfo: data?.pageInfo,
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
};

export const usePayment = (paymentId?: string | null) => {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => payment(String(paymentId)),
    enabled: Boolean(paymentId),
  });

  return {
    payment: data,
    error,
    isFetching,
    isLoading,
    refetch,
  };
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreatePaymentPayload) => createPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    createPayment: mutation.mutate,
    createPaymentAsync: mutation.mutateAsync,
    isCreatingPayment: mutation.isPending,
  };
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreatePaymentPayload }) =>
      updatePayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    updatePayment: mutation.mutate,
    isUpdatingPayment: mutation.isPending,
  };
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (paymentId: string) => deletePayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    deletePayment: mutation.mutate,
    isDeletingPayment: mutation.isPending,
  };
};

export const usePaymentsListController = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const { error, isLoading, pageInfo, payments, refetch, total } = usePayments({
    page,
    limit: pageSize,
    search: query,
    status,
  });
  const rows = useMemo(() => payments.map(toPaymentRow), [payments]);
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const changeStatus = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return {
    rows,
    error,
    isLoading,
    page,
    pageInfo,
    pageSize,
    query,
    refetch,
    setPage,
    status,
    total,
    startItem,
    endItem,
    hasPayments: rows.length > 0,
    showPagination: total > 0,
    changePageSize,
    changeQuery,
    changeStatus,
  };
};
