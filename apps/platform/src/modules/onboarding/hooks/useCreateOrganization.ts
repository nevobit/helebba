import { useMutation } from '@tanstack/react-query';
import { createOrganization } from '../services';

export const useCreateOrganization = () => {
  const { mutate, isPending } = useMutation({
    mutationKey: ['create-organization'],
    mutationFn: createOrganization,
  });

  return { createOrganization: mutate, isCreatingOrganization: isPending };
};
