import { useState } from 'react';
import { Button, Modal, TextInput, useModal } from '@hlb/design-system';
import { BookOpen, ExternalLink, Plus, Settings } from 'lucide-react';
import type { Catalog } from '@hlb/contracts';
import { useProducts } from '@/modules/inventary/products/hooks';
import { CatalogModal } from '../../components/CatalogModal';
import { useCatalogMutations, useCatalogs } from '../../hooks';
import styles from './CatalogList.module.css';

const CatalogPreview = ({ catalog, closeModal }: { catalog: Catalog; closeModal: () => void }) => {
  const { products, isLoading } = useProducts({ page: 1, limit: 100, search: '' });
  const visible = products.filter((product) => product.forSale && product.inCatalog && (catalog.selectionMode === 'all' || catalog.productIds.map(String).includes(String(product.id))));
  return <Modal.Window isOpen ariaLabel="Vista previa del catálogo" closeOnEsc closeOnOverlay onClose={closeModal} size={{ width: '100rem', maxWidth: 'calc(100vw - 3rem)' }}><Modal.Header><h2>{catalog.name}</h2><Modal.CloseButton onClick={closeModal} /></Modal.Header><Modal.Body>{isLoading ? <p>Cargando productos...</p> : <div className={styles.preview}>{visible.map((product) => <article className={styles.previewCard} key={String(product.id)}>{product.images?.[0] && <img src={product.images[0]} alt="" />}<div><h3>{product.name}</h3>{catalog.settings.importProductDescription && <p>{product.description}</p>}{catalog.settings.showPrices && <strong>{product.price ?? 0}</strong>}{catalog.settings.showStock && <p>Stock: {product.stock ?? 0}</p>}</div></article>)}</div>}</Modal.Body></Modal.Window>;
};

const CatalogList = () => {
  const [search, setSearch] = useState('');
  const { catalogs, isLoading, error } = useCatalogs(search);
  const { deleteCatalog, isDeletingCatalog } = useCatalogMutations();
  const { openModal, closeModal, requestCloseModal } = useModal();
  const openCatalog = (catalog?: Catalog) => openModal(<CatalogModal catalog={catalog} closeModal={closeModal} />, { id: catalog ? `edit-catalog-${catalog.id}` : 'create-catalog' });
  const preview = (catalog: Catalog) => openModal(<CatalogPreview catalog={catalog} closeModal={closeModal} />, { id: `preview-catalog-${catalog.id}` });
  const remove = (catalog: Catalog) => requestCloseModal({ confirm: true, title: 'Eliminar catálogo', description: `El catálogo “${catalog.name}” dejará de estar disponible.`, confirmLabel: 'Eliminar catálogo', cancelLabel: 'Cancelar', onConfirm: () => deleteCatalog(String(catalog.id)) });
  return <main className={styles.page}><title>Catálogo B2B - Helebba</title><header className={styles.header}><h1>Catálogo B2B</h1><div className={styles.actions}><Button variant="outline" theme="optional" icon={<Settings size={16} />}>Configuración</Button>{catalogs[0] && <Button variant="outline" theme="optional" icon={<ExternalLink size={16} />} onClick={() => preview(catalogs[0])}>Vista previa</Button>}<Button icon={<Plus size={16} />} onClick={() => openCatalog()}>Nuevo catálogo</Button></div></header><div className={styles.search}><TextInput placeholder="Buscar" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    {error ? <div className={styles.feedback}>No pudimos cargar los catálogos.</div> : isLoading ? <div className={styles.empty}>Cargando catálogos...</div> : catalogs.length === 0 ? <section className={styles.empty}><div><span className={styles.emptyIcon}><BookOpen size={52} /></span><h2>Catálogo B2B</h2><p>Crea tu primer catálogo y selecciona los productos que podrán consultar tus clientes.</p><Button icon={<Plus size={16} />} onClick={() => openCatalog()}>Nuevo catálogo</Button></div></section> : <section className={styles.grid}>{catalogs.map((catalog) => <article className={styles.card} key={String(catalog.id)}><div className={styles.cardHeader}><div><h2>{catalog.name}</h2><p>{catalog.selectionMode === 'all' ? 'Todos los productos disponibles' : `${catalog.productIds.length} productos`}</p></div><span className={styles.badge}>{catalog.active ? 'Activo' : 'Inactivo'}</span></div><p>Orden: {catalog.sortOrder}</p><div className={styles.cardActions}><Button size="slim" variant="outline" theme="optional" onClick={() => preview(catalog)}>Vista previa</Button><Button size="slim" variant="outline" theme="optional" onClick={() => openCatalog(catalog)}>Editar</Button><Button size="slim" variant="outline" theme="optional" className={styles.danger} disabled={isDeletingCatalog} onClick={() => remove(catalog)}>Eliminar</Button></div></article>)}</section>}
  </main>;
};
export default CatalogList;
