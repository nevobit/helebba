import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteContact } from '../services';

export function useDeleteContact() {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ['delete-contact'],
    mutationFn: (contactId: string) => deleteContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  return {
    deleteContact: mutate,
    isDeletingContact: isPending,
    error,
  };
}
