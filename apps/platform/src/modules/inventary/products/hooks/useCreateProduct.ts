import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, type CreateProductPayload } from '../services';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    createProduct: mutation.mutate,
    isCreatingProduct: mutation.isPending,
  };
};
