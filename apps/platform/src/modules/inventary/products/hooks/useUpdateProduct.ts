import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct, type CreateProductPayload } from '../services';

export const useUpdateProduct = (productId?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => updateProduct(productId!, payload),
    onSuccess: (product) => {
      queryClient.setQueryData(['product', productId], product);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    updateProduct: mutation.mutate,
    isUpdatingProduct: mutation.isPending,
  };
};
