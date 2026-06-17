import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateContact, type UpdateContactPayload } from '../services';

export function useUpdateContact() {
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationKey: ['update-contact'],
    mutationFn: ({ contactId, payload }: { contactId: string; payload: UpdateContactPayload }) =>
      updateContact(contactId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  return {
    updateContact: mutate,
    isUpdatingContact: isPending,
    error,
  };
}
