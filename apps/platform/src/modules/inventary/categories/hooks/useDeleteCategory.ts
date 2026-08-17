import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../services';

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
  return {
    deleteCategory: mutation.mutate,
    isDeletingCategory: mutation.isPending,
    deleteCategoryError: mutation.error,
  };
};
