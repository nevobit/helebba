import { useMutation } from '@tanstack/react-query';
import { login } from '../services';

export const useLogin = () => {
  const { mutate, isPending } = useMutation({
    mutationKey: ['login'],
    mutationFn: login,
  });

  return { login: mutate, isLogging: isPending };
};
