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

const benefits = [
  'Facturación y control de cobros',
  'Contactos y CRM',
  'Inventario y servicios',
  'Pagos y gastos',
  'Cuentas bancarias y caja',
  'Usuarios y permisos',
];

const supportEmail = 'mailto:soporte@helebba.com';

const TrialExpired = () => {
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

        <Button
          className={styles.primaryButton}
          size="large"
          icon={<ArrowRight size={18} />}
          iconPosition="right"
          onClick={() => {
            window.location.href = `${supportEmail}?subject=Quiero%20activar%20mi%20plan%20Helebba`;
          }}
        >
          Elige tu plan
        </Button>
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
