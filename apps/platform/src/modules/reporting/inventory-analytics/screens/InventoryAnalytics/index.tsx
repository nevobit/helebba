import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Info, MoreVertical, Search, SlidersHorizontal, Star } from 'lucide-react';
import { useInventoryAnalytics } from '../../hooks';
import styles from './InventoryAnalytics.module.css';

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);
const money = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
const decimal = (value: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value);

const reportGroups = [
  { title: 'Ventas', items: ['Ventas', 'Presupuestos', 'Proformas', 'Pedidos de venta', 'Libro facturas emitidas'] },
  { title: 'Compras', items: [] },
  { title: 'Finanzas', items: [] },
  { title: 'Inventario', items: ['Análisis de inventario'] },
  { title: 'Contactos', items: [] },
  { title: 'Empleados', items: [] },
  { title: 'Nóminas', items: [] },
  { title: 'Ausencias', items: [] },
  { title: 'Control horario', items: [] },
  { title: 'CRM', items: [] },
  { title: 'Proyectos', items: [] },
  { title: 'Actividad', items: [] },
];

const InventoryAnalytics = () => {
  const defaultEnd = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const date = new Date(); date.setDate(date.getDate() - 30); return date;
  }, []);
  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [favorite, setFavorite] = useState(false);
  const { data, isLoading, isError, refetch } = useInventoryAnalytics({ startDate, endDate, search, page, limit });
  const pages = Math.max(1, Math.ceil((data?.totalItems ?? 0) / limit));
  const first = data?.totalItems ? (page - 1) * limit + 1 : 0;
  const last = Math.min(page * limit, data?.totalItems ?? 0);

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <h1>Informes</h1>
        <section><strong>Favoritos</strong><p><Star size={14} /> Marca favoritos para acceder rápidamente</p></section>
        {reportGroups.map((group) => <section key={group.title}><strong>{group.title}</strong>{group.items.map((item) => <button className={item === 'Análisis de inventario' ? styles.active : ''} type="button" key={item}>{item}</button>)}</section>)}
      </aside>
      <div className={styles.content}>
        <header className={styles.header}>
          <h2>
            Análisis de Inventario
            <button
              type="button"
              className={`${styles.favorite} ${favorite ? styles.favoriteActive : ''}`}
              onClick={() => setFavorite((value) => !value)}
              aria-label={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Star size={18} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </h2>
          <div className={styles.filters}>
            <button type="button" className={styles.filterButton}><SlidersHorizontal size={16} /> Filtro</button>
            <label className={styles.search}><Search size={18} /><input placeholder="Buscar" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} aria-label="Buscar" /></label>
            <div className={styles.dates}><CalendarDays size={17} /><input type="date" value={startDate} max={endDate} onChange={(event) => { setStartDate(event.target.value); setPage(1); }} /><span>—</span><input type="date" value={endDate} min={startDate} onChange={(event) => { setEndDate(event.target.value); setPage(1); }} /></div>
            <button type="button" className={styles.iconButton} aria-label="Más opciones"><MoreVertical size={19} /></button>
          </div>
        </header>
        <section className={styles.tableCard}>
          {isError ? <div className={styles.message}>No pudimos cargar el informe. <button type="button" onClick={() => refetch()}>Reintentar</button></div> : (
            <div className={styles.tableWrap}>
              <table><thead><tr><th>SKU</th><th>Nombre del producto</th><th>Variante 1</th><th>Variante 2</th><th>Ventas (unidades) <Info size={14} /></th><th>Ventas <Info size={14} /></th><th>Precio medio de venta <Info size={14} /></th><th>Coste medio de ventas <Info size={14} /></th><th>Margen % <Info size={14} /></th></tr></thead>
              <tbody>{isLoading ? <tr><td colSpan={9} className={styles.message}>Cargando informe...</td></tr> : data?.items.length ? data.items.map((row) => <tr key={row.id}><td className={styles.sku}>{row.sku || '—'}</td><td><strong className={styles.productName}>{row.name}</strong></td><td>{row.variant1 || '—'}</td><td>{row.variant2 || '—'}</td><td>{decimal(row.salesUnits)}</td><td>{money(row.salesTotal)}</td><td>{money(row.averageSalePrice)}</td><td>{money(row.averageCost)}</td><td><span className={row.margin > 0 ? styles.positive : undefined}>{decimal(row.margin)} %</span></td></tr>) : <tr><td colSpan={9} className={styles.message}>No hay productos para los filtros seleccionados.</td></tr>}</tbody></table>
            </div>
          )}
          <footer><span>Mostrando {first} a {last} de {data?.totalItems ?? 0} registros</span><label>Mostrar <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select> registros</label><div><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={17} /></button><strong>{page}</strong><button disabled={page >= pages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={17} /></button></div></footer>
        </section>
      </div>
    </main>
  );
};
export default InventoryAnalytics;
