import { Button, Menus } from '@hlb/design-system';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Check,
  Grid2X2Plus,
  ImagePlus,
  Library,
  PackageOpen,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PrivateRoutes } from '@/app/router/routes';
import { useProduct } from '../../hooks';
import styles from './ProductDetails.module.css';

const moneyFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const money = (value: number | undefined) => `${moneyFormatter.format(Number(value ?? 0))} CO$`;

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const ProductDetails = () => {
  const { productId } = useParams();
  const { error, isLoading, product, refetch } = useProduct(productId);

  const productName = product?.name ?? 'Producto';
  const initials =
    productName
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'PR';
  const stock = Number(product?.stock ?? 0);
  const price = Number(product?.price ?? 0);
  const purchasePrice = Number(product?.purchasePrice ?? 0);
  const cost = Number(product?.cost ?? 0);
  const taxLabel = product?.taxes?.[0] ?? 'Impuesto sobre las ventas 20%';

  if (error) {
    return (
      <main className={styles.page}>
        <Link to={PrivateRoutes.PRODUCTS} className={styles.backIcon} aria-label="Volver a productos">
          <ArrowLeft size={17} />
        </Link>
        <section className={styles.feedback}>
          <strong>No pudimos cargar este producto.</strong>
          <Button theme="optional" variant="outline" size="medium" onClick={() => refetch()}>
            Reintentar
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <Link to={PrivateRoutes.PRODUCTS} className={styles.backIcon} aria-label="Volver a productos">
            <ArrowLeft size={17} />
          </Link>
          <span className={styles.avatar}>{initials}</span>
          <h1>{isLoading ? 'Cargando producto...' : productName}</h1>
        </div>

        <div className={styles.headerActions}>
          <Button
            className={styles.iconButton}
            variant="outline"
            theme="optional"
            size="medium"
            icon={<Grid2X2Plus size={16} />}
            aria-label="Cambiar vista"
          />
          <Button
            className={styles.iconButton}
            variant="outline"
            theme="optional"
            size="medium"
            icon={<BookOpen size={16} />}
            aria-label="Documentación"
          />
          <Menus defaultPlacement="bottom-end">
            <Menus.Menu>
              <Menus.Toggle
                id="product-detail-actions"
                className={styles.menuToggle}
                verticalIcon
                aria-label="Más acciones"
              />
              <Menus.List id="product-detail-actions" placement="bottom-end">
                <Menus.Item id="edit-product">Editar</Menus.Item>
                <Menus.Item id="delete-product" danger>
                  Eliminar
                </Menus.Item>
              </Menus.List>
            </Menus.Menu>
          </Menus>
          <Button theme="optional" variant="outline" size="medium" icon={<PackageOpen size={16} />}>
            Actualizar stock
          </Button>
          <Button theme="optional" variant="outline" size="medium" icon={<TrendingUp size={16} />}>
            Historial de stock
          </Button>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <button type="button" className={styles.linkButton}>
            <Plus size={15} /> Subir imagen
          </button>

          <div className={styles.priceSummary}>
            <div>
              <span>Precio</span>
              <strong>{money(price)}</strong>
            </div>
            <div>
              <span>Precio de compra</span>
              <strong>{money(purchasePrice)}</strong>
            </div>
            <div>
              <span>Costo</span>
              <strong>{money(cost)}</strong>
            </div>
          </div>

          <div className={styles.metaBlock}>
            <span>Impuestos</span>
            <strong>{taxLabel}</strong>
            <span>Suministrar</span>
            <strong>{product?.forPurchase ? 'Comprado' : 'No definido'}</strong>
          </div>

          <section className={styles.sidebarSection}>
            <div className={styles.catalogRow}>
              <span>
                <Library size={17} />
              </span>
              <strong>Catálogo B2B</strong>
            </div>
            <button type="button" className={styles.linkButton}>
              <Plus size={15} /> Crea tu primer catálogo
            </button>
          </section>

          <section className={styles.sidebarSection}>
            <div className={styles.posRow}>
              <span>TPV</span>
              <div>
                <strong>Punto de venta</strong>
                <p>Activa esta opción para mostrar este producto en tu app TPV.</p>
              </div>
              <button type="button" className={styles.switch} aria-label="Activar punto de venta" />
            </div>
          </section>

          <section className={styles.sidebarSection}>
            <span className={styles.sectionLabel}>Imágenes</span>
            <button type="button" className={styles.imageUpload} aria-label="Subir imagen">
              <ImagePlus size={27} />
            </button>
          </section>

          <section className={styles.sidebarSection}>
            <h2>Notas</h2>
            <button type="button" className={styles.linkButton}>
              <Plus size={15} /> Nueva nota
            </button>
          </section>

          <section className={styles.sidebarSection}>
            <h2>Archivos</h2>
            <button type="button" className={styles.linkButton}>
              <Plus size={15} /> Subir archivo
            </button>
          </section>

          <section className={styles.sidebarSection}>
            <h2>Informes de producto</h2>
            {[
              'Compradores del producto',
              'Presupuestado',
              'Proveedores del producto',
              'Precio de compra histórico',
            ].map((label) => (
              <Button key={label} type="button" theme="optional" variant="outline" size="medium">
                {label}
              </Button>
            ))}
          </section>
        </aside>

        <section className={styles.content}>
          <h2>Resumen</h2>
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span>
                <Check size={17} />
              </span>
              <div>
                <h3>Stock Total</h3>
                <strong>{stock} Unidades</strong>
                <p>Stock virtual {stock} Unidades</p>
                <p>Stock disponible {stock} Unidades</p>
              </div>
            </article>
            <article className={styles.summaryCard}>
              <span>
                <TrendingUp size={17} />
              </span>
              <div>
                <h3>Vendido este mes</h3>
                <strong>0 Unidades</strong>
                <p>0%</p>
              </div>
            </article>
            <article className={styles.summaryCard}>
              <span>
                <Bell size={17} />
              </span>
              <div>
                <h3>Alarma de stock</h3>
                <button type="button">Establecer alarma de stock</button>
              </div>
            </article>
          </div>

          <section className={styles.chartSection}>
            <h3>Gráfico de stock</h3>
            <div className={styles.chart}>
              <div className={styles.yAxis}>
                {['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1', '0'].map((value) => (
                  <span key={value}>{value}</span>
                ))}
              </div>
              <div className={styles.plot}>
                <span className={styles.line} />
                {months.map((month, index) => (
                  <span key={month} className={styles.dot} style={{ left: `${index * 9.09}%` }} />
                ))}
              </div>
              <div className={styles.months}>
                {months.map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.priceList}>
            <div className={styles.sectionHeading}>
              <h2>Lista de precios de venta</h2>
              <button type="button">Administrar listas de precios</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tarifa</th>
                  <th>Subtotal</th>
                  <th>Impuestos</th>
                  <th>Total</th>
                  <th>Margen</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Precio principal</td>
                  <td>{money(price)}</td>
                  <td>{money(0)}</td>
                  <td>{money(price)}</td>
                  <td>100.00%</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className={styles.priceList}>
            <div className={styles.sectionHeading}>
              <h2>Lista de precios de compra</h2>
              <button type="button">Administrar precios de compra</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tarifa</th>
                  <th>Subtotal</th>
                  <th>Impuestos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Precio principal</td>
                  <td>{money(purchasePrice)}</td>
                  <td>{money(0)}</td>
                  <td>{money(purchasePrice)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </section>
      </div>
    </main>
  );
};

export default ProductDetails;
