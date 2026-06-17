import styles from './Why.module.css';
import { Zap, ShieldCheck, Globe, ScanText, Wallet, Blocks } from 'lucide-react';

const cards = [
  {
    icon: Zap,
    number: '001',
    title: 'El setup más rápido del sector',
    text: 'Conecta un banco, importa tus contactos y envía tu primera factura en menos de 9 minutos.',
    tags: ['onboarding guiado', 'migración gratis'],
    className: styles.cardLarge,
  },
  {
    icon: ShieldCheck,
    number: '002',
    title: 'Cumplimiento donde importa',
    text: 'Verifactu, SII, factura electrónica, AEAT, SAT, AFIP, incluidos.',
    tags: ['Verifactu certificado', 'Ley Antifraude', 'RGPD'],
    className: styles.cardLarge,
  },
  {
    icon: Globe,
    number: '003',
    title: 'Multidivisa por defecto',
    text: 'Factura en 47 monedas. Tu contabilidad se queda en la tuya.',
    tags: ['ajustes FX', 'tipos de cambio automáticos'],
  },
  {
    icon: ScanText,
    number: '004',
    title: 'Escáner de tickets que funciona',
    text: 'Haz una foto. Leemos el importe, IVA, proveedor y categoría.',
    tags: ['ilimitado', '96% de precisión'],
  },
  {
    icon: Wallet,
    number: '005',
    title: 'Helebba Wallet',
    text: 'Una tarjeta de empresa conectada con tu contabilidad.',
    tags: ['gratis', 'tarjetas virtuales'],
  },
];

export default function Why() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <span className={styles.eyebrow}>POR QUÉ HELEBBA</span>

        <h2 className={styles.title}>
          Construido como un sistema operativo,
          <br />
          con precio de herramienta
        </h2>

        <p className={styles.description}>
          Seis razones por las que los equipos nos eligen, desde la velocidad de implementación al
          cumplimiento y las herramientas que ya usas.
        </p>

        <div className={styles.grid}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.number} className={`${styles.card} ${card.className ?? ''}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.icon}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <span className={styles.number}>{card.number}</span>
                </div>

                <h3>{card.title}</h3>
                <p>{card.text}</p>

                <div className={styles.tags}>
                  {card.tags.map((tag) => (
                    <span key={tag}>+ {tag}</span>
                  ))}
                </div>
              </article>
            );
          })}

          <article className={`${styles.card} ${styles.integrations}`}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>
                <Blocks width={18} strokeWidth="1.5px" />
              </span>
              <span className={styles.number}>006</span>
            </div>

            <h3>Integraciones · las herramientas que ya usas</h3>

            <p>
              Stripe, Shopify, WooCommerce, BBVA, Santander, ING, Revolut, Wise, Mailchimp, HubSpot,
              Slack, Zapier, Make, y una API abierta para lo demás.
            </p>

            <div className={styles.pills}>
              {[
                'stripe',
                'shopify',
                'BBVA',
                'santander',
                'revolut',
                'mailchimp',
                'HubSpot',
                'wise',
                'slack',
                'zapier',
                'make',
                'woo',
                '+ API abierta',
              ].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
