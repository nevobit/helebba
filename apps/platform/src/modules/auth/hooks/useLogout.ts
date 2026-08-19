import { useMutation } from '@tanstack/react-query';
import { logoutSession } from '../services';

export const useLogout = () => {
  const { mutate, isPending } = useMutation({
    mutationKey: ['logout'],
    mutationFn: () => logoutSession(),
  });

  return { logout: mutate, isLoggingOut: isPending };
};