import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppleLogin } from '@/modules/auth/hooks';
import { PrivateRoutes } from '@/app/router/routes';
import styles from './AppleCallback.module.css';

const AppleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithApple } = useAppleLogin();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const savedState = sessionStorage.getItem('apple_oauth_state');
    const savedStateValid = savedState === searchParams.get('state');

    if (error) {
      console.error('Apple OAuth error:', error, errorDescription);
      window.location.href = '/login?error=apple_oauth_failed';
      return;
    }

    if (!code) {
      console.error('No authorization code received');
      window.location.href = '/login?error=apple_no_code';
      return;
    }

    if (!savedStateValid) {
      console.error('Invalid OAuth state');
      window.location.href = '/login?error=apple_invalid_state';
      return;
    }

    sessionStorage.removeItem('apple_oauth_state');

    loginWithApple(code, {
      onSuccess: () => {
        navigate(PrivateRoutes.ACCOUNTS, { replace: true });
      },
      onError: (err: Error) => {
        console.error('Apple login failed:', err);
        window.location.href = `/login?error=${encodeURIComponent(err.message)}`;
      },
    });
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Completando inicio de sesión con Apple...</p>
      </div>
    </main>
  );
};

export default AppleCallback;