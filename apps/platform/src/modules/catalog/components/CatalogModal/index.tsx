import { useMemo, useState } from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import { Settings, X } from 'lucide-react';
import type { Catalog, CatalogSettings, ProductId, WarehouseId } from '@hlb/contracts';
import { useProducts } from '@/modules/inventary/products/hooks';
import { useWarehouses } from '@/modules/inventary/warehouses/hooks';
import { useCatalogMutations } from '../../hooks';
import styles from './CatalogModal.module.css';

const defaults: CatalogSettings = { importProductDescription: true, showPrices: true, showExchangeRatePrices: false, allowLotSelection: false, showStock: false, allowOutOfStockOrders: false };
type Props = { catalog?: Catalog; closeModal: () => void; onSuccess?: () => void };

export const CatalogModal = ({ catalog, closeModal, onSuccess }: Props) => {
  const [step, setStep] = useState(catalog ? 2 : 1);
  const [name, setName] = useState(catalog?.name ?? '');
  const [selectionMode, setSelectionMode] = useState<'all' | 'specific'>(catalog?.selectionMode ?? 'all');
  const [selectedIds, setSelectedIds] = useState<string[]>(() => (catalog?.productIds ?? []).map(String));
  const [sortOrder, setSortOrder] = useState(catalog?.sortOrder ?? 'manual');
  const [settings, setSettings] = useState<CatalogSettings>({ ...defaults, ...catalog?.settings });
  const [showSettings, setShowSettings] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const { products, isLoading } = useProducts({ page: 1, limit: 100, search });
  const { warehouses } = useWarehouses({ page: 1, limit: 100, search: '' });
  const { createCatalog, updateCatalog, isSavingCatalog } = useCatalogMutations();
  const eligible = useMemo(() => products.filter((product) => product.forSale && product.inCatalog), [products]);
  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const setting = <K extends keyof CatalogSettings>(key: K, value: CatalogSettings[K]) => setSettings((current) => ({ ...current, [key]: value }));
  const save = () => {
    if (!name.trim()) return setError('Ingresa el nombre del catálogo.');
    if (selectionMode === 'specific' && !selectedIds.length) return setError('Selecciona al menos un producto.');
    const payload = { name: name.trim(), active: true, selectionMode, productIds: selectedIds as ProductId[], sortOrder, settings };
    const options = { onSuccess: () => { closeModal(); onSuccess?.(); }, onError: (reason: Error) => setError(reason.message) };
    if (catalog) updateCatalog({ id: String(catalog.id), payload }, options); else createCatalog(payload, options);
  };

  return <Modal.Window isOpen ariaLabel={catalog ? 'Editar catálogo' : 'Nuevo catálogo'} className={styles.modal} closeOnEsc closeOnOverlay onClose={closeModal} size={{ width: step === 1 ? '50rem' : '92rem', maxWidth: 'calc(100vw - 3.2rem)' }}>
    <Modal.Header><h2>{catalog ? 'Editar catálogo' : 'Nuevo catálogo'}</h2><Modal.CloseButton onClick={closeModal} /></Modal.Header>
    <Modal.Body className={styles.body}>
      {step === 1 ? <div className={styles.step}><p className={styles.intro}>Selecciona los productos que aparecerán en el catálogo</p><div className={styles.radioList}><label><input type="radio" checked={selectionMode === 'all'} onChange={() => setSelectionMode('all')} /> Añadir todos los productos disponibles</label><label><input type="radio" checked={selectionMode === 'specific'} onChange={() => setSelectionMode('specific')} /> Seleccionar productos específicos</label></div></div> : <div className={styles.step}>
        <div className={styles.nameRow}><TextInput label="Nombre *" value={name} onChange={(event) => { setName(event.target.value); setError(''); }} /><button className={styles.configButton} type="button" onClick={() => setShowSettings(true)}><Settings size={16} /> Configuración del catálogo</button></div>
        <h3>Productos</h3><div className={styles.toolbar}><TextInput placeholder="Busca por nombre o SKU" value={search} onChange={(event) => setSearch(event.target.value)} /><label className={styles.selectField}><span>Orden</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}><option value="manual">Manual</option><option value="name-asc">Nombre A-Z</option><option value="name-desc">Nombre Z-A</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option></select></label></div>
        {isLoading ? <div className={styles.empty}>Cargando productos...</div> : eligible.length ? <div className={styles.products}>{eligible.map((product) => { const id = String(product.id); return <label className={styles.product} key={id}><input type="checkbox" checked={selectionMode === 'all' || selectedIds.includes(id)} disabled={selectionMode === 'all'} onChange={() => toggle(id)} />{product.images?.[0] ? <img src={product.images[0]} alt="" /> : <span>📦</span>}<span><strong>{product.name}</strong><span>{product.sku || 'Sin SKU'}</span></span><span>{product.price ?? 0}</span></label>; })}</div> : <div className={styles.empty}><div><strong>No hay productos disponibles</strong><p>Activa “Mostrar en catálogo” en los productos que quieras añadir.</p></div></div>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>}
      {showSettings && <div className={styles.configOverlay}><section className={styles.configPanel}><header className={styles.configHeader}><h2>Configuración del catálogo B2B</h2><button type="button" onClick={() => setShowSettings(false)}><X /></button></header><div className={styles.configContent}>
        <div className={styles.configCard}><h3>Ventas</h3><p>Configura la información utilizada al crear pedidos.</p><label className={styles.switch}>Importar descripción del producto <input type="checkbox" checked={settings.importProductDescription} onChange={(e) => setting('importProductDescription', e.target.checked)} /></label></div>
        <div className={styles.configCard}><h3>Productos</h3><label className={styles.switch}>Mostrar precios <input type="checkbox" checked={settings.showPrices} onChange={(e) => setting('showPrices', e.target.checked)} /></label><label className={styles.switch}>Mostrar precios con tipo de cambio <input type="checkbox" checked={settings.showExchangeRatePrices} onChange={(e) => setting('showExchangeRatePrices', e.target.checked)} /></label><label className={styles.switch}>Permitir selección de lote/serie <input type="checkbox" checked={settings.allowLotSelection} onChange={(e) => setting('allowLotSelection', e.target.checked)} /></label></div>
        <div className={styles.configCard}><h3>Stock</h3><label className={styles.selectField}><span>Bodega de la que se descontará stock</span><select value={String(settings.stockWarehouseId ?? '')} onChange={(e) => setting('stockWarehouseId', (e.target.value || undefined) as WarehouseId | undefined)}><option value="">No asignado</option>{warehouses.map((warehouse) => <option value={String(warehouse.id)} key={String(warehouse.id)}>{warehouse.name}</option>)}</select></label><label className={styles.selectField}><span>Bodega de la que se mostrará stock</span><select value={String(settings.visibleStockWarehouseId ?? '')} onChange={(e) => setting('visibleStockWarehouseId', (e.target.value || undefined) as WarehouseId | undefined)}><option value="">Todas las bodegas</option>{warehouses.map((warehouse) => <option value={String(warehouse.id)} key={String(warehouse.id)}>{warehouse.name}</option>)}</select></label><label className={styles.switch}>Mostrar stock del producto <input type="checkbox" checked={settings.showStock} onChange={(e) => setting('showStock', e.target.checked)} /></label><label className={styles.switch}>Permitir pedidos sin stock suficiente <input type="checkbox" checked={settings.allowOutOfStockOrders} onChange={(e) => setting('allowOutOfStockOrders', e.target.checked)} /></label></div>
      </div><div className={styles.footer}><Button variant="outline" theme="optional" onClick={() => setShowSettings(false)}>Cancelar</Button><Button onClick={() => setShowSettings(false)}>Aceptar</Button></div></section></div>}
    </Modal.Body><Modal.Footer className={styles.footer}>{step === 1 ? <><Button variant="outline" theme="optional" onClick={closeModal}>Cancelar</Button><Button onClick={() => setStep(2)}>Continuar</Button></> : <><Button variant="outline" theme="optional" onClick={closeModal}>Cancelar</Button><Button loading={isSavingCatalog} onClick={save}>{catalog ? 'Guardar' : 'Crear'}</Button></>}</Modal.Footer>
  </Modal.Window>;
};
