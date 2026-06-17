import Image from 'next/image';
import styles from './Footer.module.css';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const footerColumns = [
  {
    title: 'ACCESO RÁPIDO',
    links: ['Crea una cuenta gratuita', 'Iniciar sesión', 'Precios'],
  },
  {
    title: 'FUNCIONALIDADES',
    links: [
      'Lista completa',
      'ERP',
      'Programa de contabilidad',
      'Programa de facturación',
      'Programa de tesorería',
      'Inventario',
      'Equipo / RR. HH.',
      'CRM',
    ],
  },
  {
    title: 'RECURSOS',
    links: [
      'Soluciones para developers',
      'Directorio de asesorías',
      'Migración',
      'Directorio de Solution Partners',
      'Academy',
      'Webinars',
      'Guías',
      'Blog',
      'Magazine',
      'Glosario',
    ],
  },
  {
    title: 'SOBRE NOSOTROS',
    links: [
      'Quiénes somos',
      'Historias de éxito',
      'Opiniones de clientes',
      'Trabaja con nosotros',
      'Whistleblower channel',
    ],
  },
  {
    title: 'LEGAL',
    links: ['Términos y condiciones', 'Política de privacidad', 'Política de cookies'],
  },
];

export default function FooterCTA() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.cta}>
        <h2>Prueba Helebba gratis durante 7 días</h2>

        <p>Sin tarjeta de crédito. Sin compromiso. Cancela cuando quieras.</p>

        <div className={styles.actions}>
          <a href="#" className={styles.primaryButton}>
            Empezar ahora gratis
          </a>

          <a href="#" className={styles.secondaryButton}>
            Ver precios
          </a>
        </div>

        <div className={styles.benefits}>
          <span>✓ 14 días gratis</span>
          <span>✓ Sin tarjeta</span>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.brandColumn}>
            <div className={styles.logo}>◆ helebba</div>

            <div className={styles.socials}>
              <span>
                <Facebook size={22} strokeWidth="1.5px" />
              </span>
              <span>
                <Instagram size={22} strokeWidth="1.5px" />
              </span>
              <span>𝕏</span>
              <span>
                <Linkedin size={22} strokeWidth="1.5px" />
              </span>
              <span>
                <Youtube size={22} strokeWidth="1.5px" />
              </span>
            </div>

            <p className={styles.downloadText}>Escanea para descargar la app</p>

            <div className={styles.appDownload}>
              <div className={styles.qr}>
                <Image src="/qr-code.png" width={80} height={80} alt="Logo Apple" />{' '}
              </div>
              <div className={styles.stores}>
                <div className={styles.store}>
                  <Image src="/apple.png" width={13} height={15} alt="Logo Apple" />{' '}
                  <div>
                    <span>Descarga en el</span>
                    <p>App Store</p>
                  </div>
                </div>
                <div className={styles.store}>
                  <Image src="/play-store.png" width={13} height={15} alt="Logo Apple" />{' '}
                  <div>
                    <span>DISPONIBLE EN</span>
                    <p>Google Play</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.language}>
              <h4>IDIOMA</h4>
              <span>English</span>
              <strong>• Español</strong>
              <span>Català</span>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div className={styles.column} key={column.title}>
              <h3>{column.title}</h3>

              {column.links.map((link) => (
                <a href="#" key={link}>
                  {link}
                </a>
              ))}

              {column.title === 'ACCESO RÁPIDO' && <div className={styles.search}>⌕ Buscar ⌘K</div>}
            </div>
          ))}
        </div>

        <div className={styles.bottom}>
          <p>© 2026 Helebba Technologies. Todos los derechos reservados.</p>

          <a href="#">Preferencias de cookies</a>

          <div className={styles.visma}>
            <span>Revoluc Group</span>
            <span>Revoluc Careers</span>
            <strong>REVOLUC</strong>
          </div>
        </div>
      </footer>

      <button className={styles.chatButton}>▢</button>
      <button className={styles.backTop}>↑</button>
    </section>
  );
}
