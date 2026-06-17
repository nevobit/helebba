import {
  FileText,
  ClipboardCheck,
  ScanLine,
  CreditCard,
  Box,
  Users,
  BarChart3,
  Send,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';

import styles from './Banner.module.css';
import Image from 'next/image';

const sidebarIcons = [
  FileText,
  ClipboardCheck,
  ScanLine,
  CreditCard,
  Box,
  Users,
  Building2,
  BarChart3,
];

export default function Banner() {
  return (
    <section className={styles.hero}>
      <h1>
        El software de gestión para <br /> pymes y emprendedores<span>.</span>
      </h1>

      <p className={styles.subtitle}>
        Helebba es la solución en la nube con todo lo que necesitas para gestionar tu negocio, en
        cualquier momento, desde cualquier lugar.
      </p>

      <div className={styles.actions}>
        <button className={styles.primaryButton}>Prueba gratis 14 días</button>

        <button className={styles.googleButton}>
          <span className={styles.googleIcon}>
            <Image src="/google.svg" width={18} height={18} alt="Google Logo" />
          </span>
          Empieza gratis con Google
        </button>
      </div>

      <p className={styles.note}>Sin tarjeta de crédito · Cancela cuando quieras</p>

      <div className={styles.productPreview}>
        <aside className={styles.sidebar}>
          <div className={styles.logoMark} />

          <nav>
            {sidebarIcons.map((Icon, index) => (
              <button key={index} className={index === 0 ? styles.activeSidebarItem : ''}>
                <Icon size={18} />
              </button>
            ))}
          </nav>

          <div className={styles.avatar}>B</div>
        </aside>

        <div className={styles.invoice}>
          <header className={styles.invoiceHeader}>
            <div>
              <div className={styles.clientIcon}>
                <Sparkles size={28} />
              </div>

              <div>
                <h3>Cliente Demo S.L.</h3>
                <p>Carrer Demo, 1 · 00000 Barcelona</p>
              </div>
            </div>

            <div className={styles.qr} />
          </header>

          <div className={styles.invoiceClient}>
            <div>
              <span>CLIENTE</span>
              <strong>Empresa Ejemplo, S.A.</strong>
              <p>00000 Barcelona</p>
              <p>12345678A</p>
            </div>

            <div>
              <span>TOTAL</span>
              <strong>1.991,66 €</strong>
            </div>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>DESCRIPCIÓN</span>
              <span>CANTIDAD</span>
              <span>PRECIO</span>
              <span>TOTAL</span>
            </div>

            <div className={styles.tableRow}>
              <div>
                <strong>Diseño web</strong>
                <p>Landing page corporativa + responsive.</p>
              </div>
              <span>1</span>
              <span>1100 €</span>
              <strong>1.100 €</strong>
            </div>

            <div className={styles.tableRow}>
              <div>
                <strong>Branding</strong>
                <p>Logotipo, paleta de colores y guía de marca.</p>
              </div>
              <span>1</span>
              <span>546 €</span>
              <strong>546 €</strong>
            </div>
          </div>

          <button className={styles.addLine}>+ Añadir línea</button>

          <footer className={styles.invoiceFooter}>
            <div>
              <strong>Información y detalles de pago</strong>
              <p>Pago por transferencia bancaria.</p>
            </div>

            <div className={styles.totals}>
              <p>
                <span>SUBTOTAL</span>
                <strong>1.646 €</strong>
              </p>
              <p>
                <span>IVA (21%)</span>
                <strong>345,66 €</strong>
              </p>
              <p>
                <span>TOTAL</span>
                <strong>1.991,66 €</strong>
              </p>
            </div>
          </footer>
        </div>

        <aside className={styles.panel}>
          <div className={styles.tabs}>
            <button>General</button>
            <span>Mensajes</span>
            <span>Historial</span>
          </div>

          <dl className={styles.details}>
            <div>
              <dt>Total</dt>
              <dd>1.991,66 €</dd>
            </div>
            <div>
              <dt>Num de documento</dt>
              <dd>F260001</dd>
            </div>
            <div>
              <dt>Cliente</dt>
              <dd>Empresa Ejemplo, S.A.</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>14/06/2026</dd>
            </div>
          </dl>

          <div className={styles.review}>
            <Check size={16} />
            <div>
              <strong>Revisada por tu asesor</strong>
              <p>M. García · 16/06/2026</p>
            </div>
          </div>

          <div className={styles.progressBlock}>
            <div>
              <strong>Cobro</strong>
              <span>80%</span>
            </div>

            <div className={styles.progress}>
              <span />
            </div>

            <p>
              <span>1.593,33 € cobrado</span>
              <span>398,33 € pendiente</span>
            </p>
          </div>

          <div className={styles.status}>
            <span>Borrador</span>
            <button>Aprobar</button>
          </div>

          <label className={styles.category}>
            <span>Cuenta contable</span>
            <strong>Prestación de servicios</strong>
          </label>

          <button className={styles.sendButton}>
            <Send size={17} />
            Enviar
          </button>

          <div className={styles.themeDots}>
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </aside>

        <div className={styles.certified}>
          ✓<br />
          Software
          <br />
          certificado
        </div>
      </div>

      <div className={styles.logos}>
        <p>Más de 900.000 usuarios ya hacen crecer su negocio con Helebba</p>

        <div>
          <span>PROOVING™</span>
          <span>NUDE PROJECT®</span>
          <span>mambo.</span>
          <span>SNEAKERSCOL</span>
          <span>Unison.</span>
          <span>Di Bloom</span>
        </div>
      </div>

      <div className={styles.stats}>
        <span>
          <strong>40h</strong> ahorradas/mes
        </span>
        <span>
          <strong>160x</strong> más rápido facturando
        </span>
        <span>
          <strong>80%</strong> cobros más rápidos
        </span>
      </div>
    </section>
  );
}
