import { useMutation } from '@tanstack/react-query';
import { signup } from '../services';

export const useSignup = () => {
  const { mutate, isPending } = useMutation({
    mutationKey: ['signup'],
    mutationFn: signup,
  });

  return { signup: mutate, isSigningUp: isPending };
};
