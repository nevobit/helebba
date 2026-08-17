import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProduct } from '../services';

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_deleted, productId) => {
      queryClient.removeQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
  return { deleteProduct: mutation.mutate, isDeletingProduct: mutation.isPending };
};
