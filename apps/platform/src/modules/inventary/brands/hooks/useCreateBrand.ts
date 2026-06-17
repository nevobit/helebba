import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrand, type CreateBrandPayload } from '../services';

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateBrandPayload) => createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  return {
    createBrand: mutation.mutate,
    isCreatingBrand: mutation.isPending,
  };
};
