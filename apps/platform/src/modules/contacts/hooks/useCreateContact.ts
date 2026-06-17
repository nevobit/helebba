import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContact, type CreateContactPayload } from '../services';

export function useCreateContact() {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ['create-contact'],
    mutationFn: (payload: CreateContactPayload) => createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  return {
    createContact: mutate,
    isCreatingContact: isPending,
    error,
  };
}
