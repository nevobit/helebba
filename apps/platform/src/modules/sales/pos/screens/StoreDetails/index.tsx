import { Button, useModal } from '@hlb/design-system';
import type { PosCashRegister } from '@hlb/contracts';
import { Plus, Store } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RegisterModal } from '../../components/RegisterModal';
import { SessionModal } from '../../components/SessionModal';
import { usePosReceipts, usePosStore } from '../../hooks';
import styles from './StoreDetails.module.css';

const money = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
const StoreDetails = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { store, isLoading, error } = usePosStore(storeId);
  const { receipts } = usePosReceipts(storeId);
  const { openModal, closeModal } = useModal();
  if (isLoading) return <main className={styles.page}>Cargando tienda...</main>;
  if (error || !store) return <main className={styles.page}>No pudimos cargar la tienda.</main>;
  const add = () =>
    openModal(
      <RegisterModal storeId={String(store.id)} storeName={store.name} closeModal={closeModal} />,
      { id: `add-register-${store.id}` },
    );
  const session = (register: PosCashRegister, mode: 'open' | 'close') =>
    openModal(
      <SessionModal
        storeId={String(store.id)}
        register={register}
        mode={mode}
        closeModal={closeModal}
      />,
      { id: `${mode}-register-${register.id}` },
    );
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} to="/pos">
          ←
        </Link>
        <h1>{store.name}</h1>
      </header>
      <div className={styles.layout}>
        <aside className={styles.info}>
          <h2>Información de la tienda</h2>
          <p>Bodega</p>
          <strong>{store.warehouseName}</strong>
          <p>Dirección</p>
          <strong>{store.address}</strong>
          {store.phone && (
            <>
              <p>Teléfono</p>
              <strong>{store.phone}</strong>
            </>
          )}
          <div className={styles.map}>Ubicación de la tienda</div>
        </aside>
        <div>
          <div className={styles.notice}>
            <span>Habilita la opción POS en los productos que quieras vender.</span>
            <Button
              variant="outline"
              theme="optional"
              onClick={() => {
                window.location.href = '/products';
              }}
            >
              Gestionar productos
            </Button>
          </div>
          <section className={styles.registerSection}>
            <div className={styles.registerHeader}>
              <h2>Cajas registradoras</h2>
              <Button variant="outline" theme="optional" icon={<Plus size={16} />} onClick={add}>
                Añadir caja registradora
              </Button>
            </div>
            <div className={styles.registers}>
              {store.registers.map((register) => (
                <article className={styles.register} key={String(register.id)}>
                  <span
                    className={`${styles.badge} ${register.status === 'open' ? styles.badgeOpen : ''}`}
                  >
                    {register.status === 'open' ? 'Abierta' : 'Cerrada'}
                  </span>
                  <Store size={28} />
                  <h3>{register.name}</h3>
                  <p>{register.description}</p>
                  <div className={styles.actions}>
                    {register.status === 'open' ? (
                      <>
                        <Button
                          onClick={() => navigate(`/pos/${store.id}/register/${register.id}`)}
                        >
                          Ir a vender
                        </Button>
                        <Button
                          variant="outline"
                          theme="optional"
                          onClick={() => session(register, 'close')}
                        >
                          Cerrar caja
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => session(register, 'open')}>Abrir caja</Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className={styles.sessions}>
            <h2>Sesiones</h2>
            <div className={styles.tableHead}>
              <span>Caja</span>
              <span>Inicio</span>
              <span>Fin</span>
              <span>Ventas</span>
              <span>Estado</span>
            </div>
            {store.sessions.length ? (
              store.sessions.map((item) => (
                <div className={styles.tableHead} key={String(item.id)}>
                  <span>{item.registerName}</span>
                  <span>{new Date(item.openedAt).toLocaleString()}</span>
                  <span>{item.closedAt ? new Date(item.closedAt).toLocaleString() : '-'}</span>
                  <span>
                    {money(item.salesTotal)} · {item.receiptCount} tickets
                  </span>
                  <span>{item.status}</span>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Ninguna sesión encontrada</div>
            )}
          </section>
          <section className={styles.sessions}>
            <h2>Tickets recientes</h2>
            <div className={styles.receiptHead}>
              <span>Ticket</span>
              <span>Caja</span>
              <span>Fecha</span>
              <span>Pago</span>
              <span>Total</span>
            </div>
            {receipts.length ? (
              receipts.map((receipt) => (
                <div className={styles.receiptHead} key={String(receipt.id)}>
                  <span>{receipt.number}</span>
                  <span>{receipt.registerName}</span>
                  <span>{new Date(receipt.createdAt).toLocaleString()}</span>
                  <span>{receipt.payments.map((payment) => payment.method).join(', ')}</span>
                  <strong>{money(receipt.total)}</strong>
                </div>
              ))
            ) : (
              <div className={styles.empty}>Aún no hay ventas registradas.</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
export default StoreDetails;
