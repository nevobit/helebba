import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWarehouse, type CreateWarehousePayload } from '../services';

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateWarehousePayload) => createWarehouse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  return {
    createWarehouse: mutation.mutate,
    isCreatingWarehouse: mutation.isPending,
  };
};
