import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared';
import { PrivateRoutes } from '@/app/router/routes';

export const useAppleLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useSession();

  const { mutate, isPending: isLoggingApple } = useMutation({
    mutationKey: ['login-apple'],
    mutationFn: async (code: string) => {
      const { data } = await import('@/shared/api').then(({ api }) =>
        api.post('/auth/oauth/apple', { code })
      );
      return data;
    },
    onSuccess: async (data) => {
      signIn({
        user: data.user,
        globalToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      navigate(PrivateRoutes.ACCOUNTS);
    },
  });

  return { loginWithApple: mutate, isLoggingApple };
};