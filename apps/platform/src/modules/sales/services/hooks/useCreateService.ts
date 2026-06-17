import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createService, type CreateServicePayload } from '../services';

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateServicePayload) => createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    createService: mutation.mutate,
    isCreatingService: mutation.isPending,
  };
};
