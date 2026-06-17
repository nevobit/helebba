import { Button, TextInput } from '@hlb/design-system';
import { Link, useNavigate } from 'react-router-dom';
import { PublicRoutes } from '@/app/router/routes';
import styles from './Login.module.css';
import { useLogin } from '@/modules/auth/hooks';
import { useForm } from '@hlb/design-system';
import { useState, type FormEvent } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleLogin as useGoogleLoginCode } from '@/modules/auth/hooks';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLogging } = useLogin();
  const { loginWithGoogle: loginWithGoogleCode } = useGoogleLoginCode();

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'openid email profile',
    ux_mode: 'popup',
    onSuccess: async ({ code }) => {
      await loginWithGoogleCode(code);
    },
    onError: () => {
      console.error('Google Login Failed');
    },
  });

  const { formState, handleChange } = useForm({ email: '' });
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = formState.email.trim();

    if (!email) {
      setError('Ingresa tu correo electrónico para continuar.');
      return;
    }

    setError(null);
    login(email, {
      onSuccess: () => {
        navigate(PublicRoutes.LOGIN_VERIFY, { state: { email } });
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'No pudimos enviar el código.');
      },
    });
  };

  return (
    <main className={styles.page}>
      <title>Iniciar sesión - Helebba</title>
      <header className={styles.topbar}>
        <Link className={styles.brand} to={PublicRoutes.LOGIN} aria-label="Helebba">
          <img src="/images/logo.svg" alt="" />
        </Link>

        <div className={styles.topbarAction}>
          <span>¿Nuevo en Helebba?</span>
          <Link to={PublicRoutes.SIGNUP}>Registrarse</Link>
        </div>
      </header>

      <section className={styles.card} aria-labelledby="login-title">
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.header}>
            <h1 id="login-title">Inicia sesión en tu cuenta</h1>
            <p>¡Bienvenido de nuevo! Introduce tus credenciales para continuar.</p>
          </div>

          <div className={styles.socialGrid}>
            {/* <GoogleLogin
              locale="es"
              onSuccess={(credentialResponse) => {
                if (!credentialResponse.credential) return;
                loginWithGoogle(credentialResponse.credential);
              }}
              onError={() => {
                console.error('Google Login Failed');
              }}
              logo_alignment="center"
              text="continue_with"
              theme="outline"
              size="large"
              shape="rectangular"
              containerProps={{
                children: 'Continuar con Google',
              }}
            /> */}
            <button className={styles.socialButton} type="button" onClick={() => googleLogin()}>
              <span className={styles.googleMark}>
                <img src="/images/google.svg" />
              </span>
              Continuar con Google
            </button>
            <button className={styles.iconButton} type="button" aria-label="Continuar con Apple">
              <span className={styles.appleMark} aria-hidden="true">
                
              </span>
            </button>
          </div>

          <div className={styles.divider}>
            <span>o con tu email</span>
          </div>

          <div className={styles.fields}>
            <TextInput
              type="email"
              label="Correo electrónico"
              placeholder="jhondoe@email.com"
              value={formState.email}
              name="email"
              onChange={handleChange}
              error={error ?? undefined}
              disabled={isLogging}
            />
          </div>

          <div className={styles.formMeta}>
            <label className={styles.checkbox}>
              <input type="checkbox" />
              <span>Mantener sesión</span>
            </label>
          </div>

          <Button fullWidth size="large" type="submit" loading={isLogging} disabled={isLogging}>
            Iniciar sesión
          </Button>
        </form>

        <div className={styles.footer}>
          ¿Nuevo en Helebba? <Link to={PublicRoutes.SIGNUP}>Crear cuenta</Link>
        </div>
      </section>

      <div className={styles.locale}>
        <button type="button">Español</button>
      </div>
    </main>
  );
};

export default Login;
