import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory, type CreateCategoryPayload } from '../services';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    createCategory: mutation.mutate,
    isCreatingCategory: mutation.isPending,
  };
};
