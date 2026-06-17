import { Button, TextInput, useForm } from '@hlb/design-system';
import { Link, useNavigate } from 'react-router-dom';
import { PublicRoutes } from '@/app/router/routes';
import styles from './Signup.module.css';
import { useState, type FormEvent } from 'react';
import { useSignup } from '@/modules/auth/hooks';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isSigningUp } = useSignup();
  const { formState, handleChange } = useForm({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = formState.email.trim();
    const name = formState.name.trim();
    const phone = formState.phone.trim();

    if (!name) {
      setErrors({ name: 'Ingresa tu nombre completo para continuar.' });
      return;
    }

    if (!email) {
      setErrors({ email: 'Ingresa tu correo electrónico para continuar.' });
      return;
    }

    setErrors({});
    signup(email, {
      onSuccess: () => {
        navigate(PublicRoutes.SIGNUP_VERIFY, {
          state: {
            email,
            user: {
              email,
              name,
              phone,
            },
          },
        });
      },
      onError: (err) => {
        setErrors({
          email: err instanceof Error ? err.message : 'No pudimos enviar el código.',
        });
      },
    });
  };

  return (
    <main className={styles.page}>
      <title>Prueba Helebba durante 14 días gratis - Helebba</title>
      <header className={styles.topbar}>
        <Link className={styles.brand} to={PublicRoutes.LOGIN} aria-label="Helebba">
          <img src="/images/logo.svg" alt="" />
        </Link>

        <div className={styles.topbarAction}>
          <span>¿Ya tienes una cuenta?</span>
          <Link to={PublicRoutes.LOGIN}>Acceder</Link>
        </div>
      </header>

      <section className={styles.card} aria-labelledby="signup-title">
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.header}>
            <h1 id="signup-title">Prueba Helebba 14 días gratis</h1>
            <p>Sin compromisos, sin límites y sin necesidad de tarjeta de crédito.</p>
          </div>

          <div className={styles.socialGrid}>
            <button className={styles.socialButton} type="button">
              <span className={styles.googleMark}>
                <img src="/images/google.svg" alt="" />
              </span>
              Registrarme con Google
            </button>
            <button className={styles.iconButton} type="button" aria-label="Registrarme con Apple">
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
              type="text"
              label="Nombre completo"
              placeholder="Nombre completo"
              name="name"
              value={formState.name}
              onChange={handleChange}
              error={errors.name}
              disabled={isSigningUp}
            />
            <TextInput
              type="email"
              label="Correo electrónico"
              placeholder="Email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isSigningUp}
            />

            <div className={styles.phoneField}>
              <div className={styles.phoneLabel}>
                <label htmlFor="signup-phone">Teléfono</label>
                <span>Opcional</span>
              </div>

              <div className={styles.phoneControl}>
                <button className={styles.countryButton} type="button" aria-label="Cambiar país">
                  <span aria-hidden="true">CO</span>
                  <span>+57</span>
                </button>
                <input
                  id="signup-phone"
                  type="tel"
                  placeholder="Teléfono"
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                  disabled={isSigningUp}
                />
              </div>
            </div>
          </div>

          <Button fullWidth size="large" type="submit" loading={isSigningUp} disabled={isSigningUp}>
            Empieza tu prueba de 14 días
          </Button>
        </form>

        <div className={styles.legal}>
          Al continuar confirmas que aceptas nuestros <a href="/terms">Términos y condiciones</a>,{' '}
          <a href="/privacy">Política de Privacidad</a> y <a href="/cookies">Cookies</a>.
        </div>

        <div className={styles.footer}>
          ¿Ya tienes una cuenta? <Link to={PublicRoutes.LOGIN}>Acceder</Link>
        </div>
      </section>

      <div className={styles.locale}>
        <button type="button">Español</button>
      </div>
    </main>
  );
};

export default Signup;
