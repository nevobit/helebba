import { Button } from '@hlb/design-system';
import type { User } from '@hlb/contracts';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PrivateRoutes, PublicRoutes } from '@/app/router/routes';
import { useSession } from '@/shared';
import { useLogin, useSignup, useVerifyCode } from '@/modules/auth/hooks';
import styles from './VerifyCode.module.css';

type VerifyMode = 'login' | 'signup';

type VerifyCodeProps = {
  mode: VerifyMode;
};

type VerifyLocationState = {
  email?: string;
  user?: Partial<User> & { email?: string };
};

const contentByMode = {
  login: {
    title: 'Verifica tu correo',
    description: 'Ingresa el código que enviamos a tu correo para iniciar sesión.',
    backLabel: 'Cambiar correo',
    backTo: PublicRoutes.LOGIN,
    cta: 'Confirmar e iniciar sesión',
    footerText: '¿Nuevo en Helebba?',
    footerAction: 'Registrarse',
    footerTo: PublicRoutes.SIGNUP,
  },
  signup: {
    title: 'Confirma tu cuenta',
    description: 'Ingresa el código que enviamos a tu correo para activar tu prueba.',
    backLabel: 'Cambiar información',
    backTo: PublicRoutes.SIGNUP,
    cta: 'Confirmar cuenta',
    footerText: '¿Ya tienes una cuenta?',
    footerAction: 'Acceder',
    footerTo: PublicRoutes.LOGIN,
  },
} as const;

const codeSlots = Array.from({ length: 6 }, (_, index) => index);
const emptyCode = Array.from({ length: 6 }, () => '');
const nextRouteByMode = {
  login: PrivateRoutes.ACCOUNTS,
  signup: PrivateRoutes.NEW_ACCOUNT,
} as const;

const VerifyCode = ({ mode }: VerifyCodeProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useSession((state) => state.signIn);
  const { login, isLogging } = useLogin();
  const { signup, isSigningUp } = useSignup();
  const { verifyCode, isVerifying } = useVerifyCode();
  const content = contentByMode[mode];
  const locationState = location.state as VerifyLocationState | null;
  const email = locationState?.email ?? locationState?.user?.email ?? '';
  const user = useMemo(
    () => ({
      ...(locationState?.user ?? {}),
      email,
    }),
    [email, locationState?.user],
  );
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState(emptyCode);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const code = digits.join('');
  const canSubmit = Boolean(email) && code.length === 6;
  const isResending = mode === 'login' ? isLogging : isSigningUp;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const focusSlot = (index: number) => {
    inputRefs.current[Math.max(0, Math.min(index, codeSlots.length - 1))]?.focus();
  };

  const applyCode = (value: string, startIndex: number) => {
    const nextValues = value
      .replace(/\D/g, '')
      .slice(0, codeSlots.length - startIndex)
      .split('');

    if (!nextValues.length) return;

    setDigits((current) => {
      const next = [...current];
      nextValues.forEach((digit, offset) => {
        next[startIndex + offset] = digit;
      });
      return next;
    });
    setError(null);
    setNotice(null);
    focusSlot(startIndex + nextValues.length);
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    applyCode(event.target.value, index);
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    applyCode(event.clipboardData.getData('text'), index);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace') return;

    event.preventDefault();
    setDigits((current) => {
      const next = [...current];

      if (next[index]) {
        next[index] = '';
        return next;
      }

      if (index > 0) {
        next[index - 1] = '';
        focusSlot(index - 1);
      }

      return next;
    });
    setError(null);
  };

  const resendCode = () => {
    if (!email) {
      setError('Vuelve a ingresar tu correo para pedir un nuevo código.');
      return;
    }

    setError(null);
    setNotice(null);

    const resend = mode === 'login' ? login : signup;
    resend(email, {
      onSuccess: () => {
        setDigits(emptyCode);
        setNotice('Te enviamos un nuevo código.');
        focusSlot(0);
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'No pudimos reenviar el código.');
      },
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      setError('Vuelve a ingresar tu correo para verificar tu código.');
      return;
    }

    if (code.length < 6) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }

    setError(null);
    setNotice(null);

    verifyCode(
      {
        code,
        user,
      },
      {
        onSuccess: ({ refreshToken, token, user }) => {
          signIn({
            user,
            globalToken: token,
            refreshToken,
          });
          navigate(nextRouteByMode[mode], { replace: true });
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'No pudimos verificar el código.');
        },
      },
    );
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.brand} to={PublicRoutes.LOGIN} aria-label="Helebba">
          <img src="/images/logo.svg" alt="" />
        </Link>

        <div className={styles.topbarAction}>
          <span>{content.footerText}</span>
          <Link to={content.footerTo}>{content.footerAction}</Link>
        </div>
      </header>

      <section className={styles.card} aria-labelledby="verify-title">
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.header}>
            <h1 id="verify-title">{content.title}</h1>
            <p>{content.description}</p>
          </div>

          <div className={styles.emailPreview}>
            <span>{email || 'Correo no disponible'}</span>
          </div>

          <div className={styles.codeGroup} aria-label="Código de verificación">
            {codeSlots.map((slot) => (
              <input
                key={slot}
                ref={(node) => {
                  inputRefs.current[slot] = node;
                }}
                aria-label={`Dígito ${slot + 1}`}
                autoComplete={slot === 0 ? 'one-time-code' : 'off'}
                disabled={isVerifying}
                inputMode="numeric"
                maxLength={1}
                onChange={(event) => handleChange(slot, event)}
                onKeyDown={(event) => handleKeyDown(slot, event)}
                onPaste={(event) => handlePaste(slot, event)}
                pattern="[0-9]*"
                type="text"
                value={digits[slot]}
              />
            ))}
          </div>

          {error && (
            <p className={styles.feedback} role="alert">
              {error}
            </p>
          )}
          {notice && <p className={styles.success}>{notice}</p>}

          <div className={styles.actions}>
            <button
              className={styles.linkButton}
              type="button"
              onClick={resendCode}
              disabled={isResending || isVerifying}
            >
              {isResending ? 'Reenviando...' : 'Reenviar código'}
            </button>
            <Link to={content.backTo}>{content.backLabel}</Link>
          </div>

          <Button
            fullWidth
            size="large"
            type="submit"
            loading={isVerifying}
            disabled={!canSubmit || isVerifying}
          >
            {content.cta}
          </Button>
        </form>

        <div className={styles.footer}>
          {content.footerText} <Link to={content.footerTo}>{content.footerAction}</Link>
        </div>
      </section>

      <div className={styles.locale}>
        <button type="button">Español</button>
      </div>
    </main>
  );
};

export default VerifyCode;
