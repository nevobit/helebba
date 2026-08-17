import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCategory, type CreateCategoryPayload } from '../services';

export const useUpdateCategory = (categoryId?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => updateCategory(categoryId!, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
  return { updateCategory: mutation.mutate, isUpdatingCategory: mutation.isPending };
};
