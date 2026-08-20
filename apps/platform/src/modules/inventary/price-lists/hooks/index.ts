import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPriceList, priceLists, updatePriceList, type CreatePriceListPayload } from '../services';

export function usePriceLists() {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['price-lists'],
    queryFn: () => priceLists({ page: 1, limit: 100 }),
  });

  return {
    priceLists: data?.items ?? [],
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}

export function useCreatePriceList() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreatePriceListPayload) => createPriceList(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['price-lists'] });
    },
  });

  return {
    createPriceList: mutation.mutate,
    isCreatingPriceList: mutation.isPending,
  };
}

export function useUpdatePriceList() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreatePriceListPayload }) =>
      updatePriceList(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['price-lists'] });
    },
  });

  return {
    updatePriceList: mutation.mutate,
    isUpdatingPriceList: mutation.isPending,
  };
}