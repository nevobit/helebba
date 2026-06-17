import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPaymentMethod,
  paymentMethods,
  updatePaymentMethod,
  type CreatePaymentMethodPayload,
  type PaymentMethodListParams,
  type UpdatePaymentMethodPayload,
} from '../services';

export const paymentMethodsQueryKey = (params?: PaymentMethodListParams) => ['payment-methods', params];

export const usePaymentMethods = (params: PaymentMethodListParams = {}) => {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: paymentMethodsQueryKey(params),
    queryFn: () => paymentMethods(params),
  });

  return {
    paymentMethods: data?.items ?? [],
    pageInfo: data?.pageInfo,
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreatePaymentMethodPayload) => createPaymentMethod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });

  return {
    createPaymentMethod: mutation.mutate,
    isCreatingPaymentMethod: mutation.isPending,
  };
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentMethodPayload }) =>
      updatePaymentMethod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });

  return {
    updatePaymentMethod: mutation.mutate,
    isUpdatingPaymentMethod: mutation.isPending,
  };
};
