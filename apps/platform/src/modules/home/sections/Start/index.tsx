import { Building2, CreditCard } from 'lucide-react';
import { Button, TextInput } from '@hlb/design-system';
import styles from './Start.module.css';

export function Start() {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h2>Empezar a facturar</h2>
        <p>
          Complete los siguientes pasos para configurar sus documentos de ventas y mejorar su
          proceso de pago.
        </p>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <button className={`${styles.step} ${styles.active}`}>
            <Building2 size={18} />
            <span>Los detalles de su negocio</span>
          </button>

          <button className={styles.step}>
            <CreditCard size={18} />
            <span>Métodos de pago</span>
          </button>
        </aside>

        <div className={styles.content}>
          <div className={styles.formHeader}>
            <h3>Completa los datos de tu negocio</h3>
            <p>
              Complete estos campos con la información que utilizo para registrar legalmente su
              empresa.
            </p>
          </div>

          <form className={styles.form}>
            <div className={styles.gridTwo}>
              <TextInput label="Nombre de la empresa" defaultValue="Prooving S.A.S" />
              <TextInput label="ID de la empresa" />
            </div>

            <TextInput label="Dirección" />

            <div className={styles.gridThree}>
              <TextInput label="Código postal" />
              <TextInput label="Ciudad" />
              {/* 
              <Select label="País" defaultValue="CO">
                <option value="CO">Colombia</option>
                <option value="MX">México</option>
                <option value="CL">Chile</option>
                <option value="PE">Perú</option>
                <option value="US">Estados Unidos</option>
              </Select> */}
            </div>

            <div className={styles.divider} />

            <div className={styles.formHeader}>
              <h3>Detalles de facturación</h3>
              <p>
                Seleccione los métodos de pago que tendrá disponibles para sus facturas y ventas.
              </p>
            </div>

            <div className={styles.paymentGrid}>
              <label className={styles.paymentOption}>
                <input type="checkbox" defaultChecked />
                <span>
                  <strong>Transferencia bancaria</strong>
                  <small>Recibe pagos directamente en tu cuenta.</small>
                </span>
              </label>

              <label className={styles.paymentOption}>
                <input type="checkbox" />
                <span>
                  <strong>Efectivo</strong>
                  <small>Para pagos presenciales o contraentrega.</small>
                </span>
              </label>

              <label className={styles.paymentOption}>
                <input type="checkbox" />
                <span>
                  <strong>Tarjeta / pasarela</strong>
                  <small>Wompi, Mercado Pago, PayU u otra integración.</small>
                </span>
              </label>

              <label className={styles.paymentOption}>
                <input type="checkbox" />
                <span>
                  <strong>Pago a crédito</strong>
                  <small>Addi, Sistecrédito u opciones por cuotas.</small>
                </span>
              </label>
            </div>

            <button type="button" className={styles.createPayment}>
              + Crear nuevo método de pago
            </button>

            <div className={styles.actions}>
              <Button type="submit">Continuar</Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
