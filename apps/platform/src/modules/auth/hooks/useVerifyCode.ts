import { useMutation } from '@tanstack/react-query';
import { verifyCode } from '../services';

export const useVerifyCode = () => {
  const { mutate, isPending } = useMutation({
    mutationKey: ['verify-code'],
    mutationFn: verifyCode,
  });

  return { verifyCode: mutate, isVerifying: isPending };
};
