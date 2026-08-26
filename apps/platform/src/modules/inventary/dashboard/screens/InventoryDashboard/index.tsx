import {
  ArrowLeftRight,
  BarChart3,
  Barcode,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Import,
  Map,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useInventoryDashboard } from '../../hooks';
import type { InventoryOrderSummary } from '../../services';
import styles from './InventoryDashboard.module.css';

const money = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
const number = (value: number) => new Intl.NumberFormat('es-CO').format(value);

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useInventoryDashboard();
  const orders: Array<{ label: string; value?: InventoryOrderSummary; path: string }> = [
    { label: 'Pedidos de venta', value: data?.orders.sales, path: '/sales/estimates' },
    { label: 'Pedidos de compra', value: data?.orders.purchases, path: '/inventory/purchase-orders' },
    { label: 'Pedidos de fabricación', value: data?.orders.manufacturing, path: '/products' },
    { label: 'Albaranes de venta', value: data?.orders.salesDeliveryNotes, path: '/sales/revenue' },
    { label: 'Albaranes de compra', value: data?.orders.purchaseDeliveryNotes, path: '/purchases' },
  ];
  const operations = [
    {
      title: 'Actualizar stock',
      description: 'Hacer inventario o ajustes de stock en masa',
      icon: RefreshCw,
      path: '/products',
    },
    {
      title: 'Transferir stock',
      description: 'Mover productos entre bodegas',
      icon: ArrowLeftRight,
      path: '/inventory/warehouses',
    },
    {
      title: 'Imprimir códigos de barras',
      description: 'Genera las etiquetas de tus productos para imprimirlas',
      icon: Barcode,
      path: '/products',
    },
    {
      title: 'Importar',
      description: 'Actualiza de forma masiva tus productos desde Excel',
      icon: Import,
      path: '/products',
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Panel de control</h1>
        <nav>
          <button type="button" aria-label="Bodegas" onClick={() => navigate('/inventory/warehouses')}>
            <Map size={18} />
          </button>
          <button type="button" aria-label="Configuración" onClick={() => window.location.assign('#settings:/inventory')}>
            <Settings size={18} />
          </button>
          <button type="button" onClick={() => navigate('/reporting/inventoryanalytics')}>
            <BarChart3 size={18} /> Análisis inventario
          </button>
          <button type="button" onClick={() => navigate('/catalog')}>
            <ExternalLink size={18} /> Ver catálogo B2B
          </button>
        </nav>
      </header>

      {isError && (
        <div className={styles.error}>
          No pudimos cargar el resumen de inventario.
          <button type="button" onClick={() => refetch()}>Reintentar</button>
        </div>
      )}

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2>Productos</h2>
          <Link to="/products">Ir a productos</Link>
        </div>
        <div className={styles.metrics} aria-busy={isLoading}>
          <article><span>Unidades de producto</span><strong>{isLoading ? '—' : number(data?.productUnits ?? 0)}</strong></article>
          <article><span>Valor del stock</span><strong>{isLoading ? '—' : money(data?.stockValue ?? 0)}</strong></article>
          <article><span>Coste medio</span><strong>{isLoading ? '—' : money(data?.averageCost ?? 0)}</strong></article>
        </div>
      </section>

      <section className={`${styles.card} ${styles.orders}`}>
        <div className={styles.sectionHeader}>
          <h2>Pedidos <small>(últimos 30 días)</small></h2>
          <Link to="/inventory/purchase-orders">Ir a pedidos</Link>
        </div>
        {orders.map((item) => (
          <button type="button" className={styles.orderRow} key={item.label} onClick={() => navigate(item.path)}>
            <strong>{item.label}</strong>
            <span>{isLoading ? '—' : `${number(item.value?.units ?? 0)} unidades`}</span>
            <span>{isLoading ? '—' : money(item.value?.total ?? 0)}</span>
            <ChevronRight size={18} />
          </button>
        ))}
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h2>Operaciones</h2>
          <Link to="/products">Ir a productos</Link>
        </div>
        <div className={styles.operations}>
          {operations.map((item) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.title} onClick={() => navigate(item.path)}>
                <span><Icon size={21} /></span>
                <div><strong>{item.title}</strong><small>{item.description}</small></div>
              </button>
            );
          })}
        </div>
      </section>
      <span className={styles.srOnly}><BookOpen />Panel de inventario</span>
    </main>
  );
};

export default InventoryDashboard;
