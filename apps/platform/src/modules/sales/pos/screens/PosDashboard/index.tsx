import { Button, useModal } from '@hlb/design-system';
import { BarChart3, BookOpen, Grid2X2Plus, Plus, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StoreModal } from '../../components/StoreModal';
import { usePosStores } from '../../hooks';
import styles from './PosDashboard.module.css';
const PosDashboard = () => {
  const { stores, isLoading, error } = usePosStores();
  const { openModal, closeModal } = useModal();
  const create = () =>
    openModal(<StoreModal closeModal={closeModal} />, { id: 'create-pos-store' });
  return (
    <main className={styles.page}>
      <title>Punto de venta - Helebba</title>
      <header className={styles.header}>
        <h1>Punto de venta</h1>
        <div className={styles.actions}>
          <Button
            variant="outline"
            theme="optional"
            icon={<Grid2X2Plus size={16} />}
            aria-label="Aplicaciones"
          />
          <Button
            variant="outline"
            theme="optional"
            icon={<BookOpen size={16} />}
            aria-label="Ayuda"
          />
          <Button variant="outline" theme="optional" icon={<Plus size={16} />} onClick={create}>
            Crear tienda
          </Button>
        </div>
      </header>
      {error ? (
        <div className={styles.panel}>No pudimos cargar las tiendas.</div>
      ) : isLoading ? (
        <div className={styles.empty}>Cargando tiendas...</div>
      ) : stores.length === 0 ? (
        <section className={styles.panel}>
          <div className={styles.empty}>
            <div>
              <span className={styles.icon}>
                <Store size={54} />
              </span>
              <h2>Añade tiendas para gestionar tus ventas</h2>
              <p>
                Aquí encontrarás la información general de todas tus tiendas y sus cajas
                registradoras.
              </p>
              <Button onClick={create}>Crea tu primera tienda</Button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <div className={styles.notice}>
            <span>
              Para empezar a vender, habilita la opción POS en los productos que quieras ofrecer.
            </span>
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
          <div className={styles.layout}>
            <div>
              <section className={styles.inventory}>
                <h2>Panel de control de inventario</h2>
                <p>
                  Gestiona tus productos y controla el stock en las bodegas vinculadas a tus
                  tiendas.
                </p>
                <Button
                  variant="outline"
                  theme="optional"
                  onClick={() => {
                    window.location.href = '/products';
                  }}
                >
                  Ir a Inventario
                </Button>
              </section>
              <section className={styles.sales}>
                <h2>Productos más vendidos</h2>
                <div className={styles.salesEmpty}>
                  <div>
                    <BarChart3 size={54} />
                    <h3>Aún no has vendido ningún producto.</h3>
                  </div>
                </div>
              </section>
            </div>
            <aside>
              <div className={styles.stores}>
                {stores.map((store) => (
                  <Link to={`/pos/${store.id}`} className={styles.store} key={String(store.id)}>
                    <div className={styles.storeTop}>
                      <div>
                        <h2>{store.name}</h2>
                        <p>{store.address}</p>
                      </div>
                      <span>›</span>
                    </div>
                    <div className={styles.registers}>
                      Cajas registradoras:{' '}
                      <strong>
                        {store.registers.filter((item) => item.status === 'open').length}
                      </strong>{' '}
                      abiertas ·{' '}
                      <strong>
                        {store.registers.filter((item) => item.status === 'closed').length}
                      </strong>{' '}
                      cerradas
                    </div>
                  </Link>
                ))}
              </div>
              <section className={styles.promo}>
                <h2>Helebba POS</h2>
                <ul>
                  <li>Unifica ventas físicas e inventario.</li>
                  <li>Escanea códigos de barras y supervisa cajas.</li>
                  <li>Mantén actualizado el stock.</li>
                </ul>
              </section>
            </aside>
          </div>
        </>
      )}
    </main>
  );
};
export default PosDashboard;
