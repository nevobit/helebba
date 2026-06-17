import { useMutation } from '@tanstack/react-query';
import { loginGoogle } from '../services';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared';
import { PrivateRoutes } from '@/app/router/routes';

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useSession();

  const { mutate, isPending: isLoggingGoogle } = useMutation({
    mutationKey: ['login'],
    mutationFn: loginGoogle,
    onSuccess: async (data) => {
      signIn({
        user: data.user,
        globalToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      navigate(PrivateRoutes.ACCOUNTS);
    },
  });

  return { loginWithGoogle: mutate, isLoggingGoogle };
};
