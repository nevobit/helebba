import { useState } from 'react';
import { Button } from '@hlb/design-system';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import styles from './TrialExpired.module.css';
import { useSession } from '@/shared';
import { api } from '@/shared/api';

const benefits = [
  'Facturación y control de cobros',
  'Contactos y CRM',
  'Inventario y servicios',
  'Pagos y gastos',
  'Cuentas bancarias y caja',
  'Usuarios y permisos',
];

const supportEmail = 'mailto:soporte@helebba.com';

const plans = [
  { code: 'plus', name: 'Plus', price: 19500, description: 'Para empezar a organizar tu negocio.' },
  { code: 'basic', name: 'Basic', price: 36500, description: 'Para equipos pequeños que están creciendo.' },
  { code: 'standard', name: 'Business', price: 69500, description: 'Para centralizar toda la operación.' },
] as const;

type BillingProvider = 'mercadopago' | 'stripe';

const TrialExpired = () => {
  const email = useSession((state) => state.user?.email ?? state.organization?.email ?? '');
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number]['code']>('basic');
  const [loadingProvider, setLoadingProvider] = useState<BillingProvider | null>(null);
  const [error, setError] = useState('');

  const beginCheckout = async (provider: BillingProvider) => {
    setError('');
    setLoadingProvider(provider);
    try {
      const { data } = await api.post<{ checkoutUrl: string }>('/subscriptions/checkout', {
        provider,
        planCode: selectedPlan,
        interval: 'monthly',
        customerEmail: email,
      }, { headers: { 'Idempotency-Key': crypto.randomUUID() } });
      window.location.assign(data.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'No pudimos iniciar el pago.');
      setLoadingProvider(null);
    }
  };

  return (
    <main className={styles.page}>
      <title>Prueba finalizada - Helebba</title>

      <section className={styles.heroCard} aria-labelledby="trial-expired-title">
        <span className={styles.ribbon}>50% descuento</span>

        <div className={styles.iconWrap} aria-hidden="true">
          <Clock3 size={34} />
        </div>

        <h1 id="trial-expired-title">Tu periodo de prueba ha finalizado</h1>
        <p className={styles.lead}>
          Elige hoy tu plan y mantén activo el acceso a las herramientas de tu negocio.
        </p>

        <div className={styles.benefits}>
          {benefits.map((benefit) => (
            <span key={benefit}>
              <CheckCircle2 size={18} />
              {benefit}
            </span>
          ))}
        </div>

        <div className={styles.plans}>
          {plans.map((plan) => (
            <button key={plan.code} type="button" className={selectedPlan === plan.code ? styles.selectedPlan : styles.plan} onClick={() => setSelectedPlan(plan.code)}>
              <strong>{plan.name}</strong>
              <span>{plan.description}</span>
              <b>${plan.price.toLocaleString('es-CO')} COP/mes</b>
            </button>
          ))}
        </div>
        <div className={styles.checkoutActions}>
          <Button className={styles.primaryButton} size="large" disabled={!email || loadingProvider !== null} icon={<ArrowRight size={18} />} iconPosition="right" onClick={() => beginCheckout('mercadopago')}>
            {loadingProvider === 'mercadopago' ? 'Conectando...' : 'Pagar con Mercado Pago'}
          </Button>
          <Button className={styles.primaryButton} size="large" variant="outline" theme="optional" disabled={!email || loadingProvider !== null} onClick={() => beginCheckout('stripe')}>
            {loadingProvider === 'stripe' ? 'Conectando...' : 'Pagar con Stripe'}
          </Button>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </section>

      <section className={styles.helpCard} aria-labelledby="trial-help-title">
        <h2 id="trial-help-title">¿Todavía no te has decidido?</h2>

        <a href={`${supportEmail}?subject=Quiero%20ampliar%20mi%20prueba%20Helebba`}>
          <ShieldCheck size={18} />
          <span>
            <strong>Amplía tu prueba</strong>
            Te regalamos 7 días más para que sigas explorando Helebba.
          </span>
        </a>

        <a href={`${supportEmail}?subject=Quiero%20hablar%20con%20Helebba`}>
          <MessageCircle size={18} />
          <span>
            <strong>Habla con nosotros</strong>
            Resolvemos tus dudas y te mostramos cómo Helebba se adapta a tu negocio.
          </span>
        </a>

        <a href={`${supportEmail}?subject=Necesito%20ayuda%20con%20mi%20cuenta%20Helebba`}>
          <Mail size={18} />
          <span>
            <strong>Soporte</strong>
            Si necesitas recuperar acceso o revisar tu cuenta, te acompañamos.
          </span>
        </a>
      </section>
    </main>
  );
};

export default TrialExpired;
