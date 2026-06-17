import { useMutation } from '@tanstack/react-query';
import { loginOrganization } from '../services';

export const useLoginOrganization = () => {
  const { mutate, isPending } = useMutation({
    mutationKey: ['login-organization'],
    mutationFn: loginOrganization,
  });

  return { loginOrganization: mutate, isLoggingOrganization: isPending };
};
