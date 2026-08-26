import { useMemo, type ReactNode } from 'react';
import { Button, useModal } from '@hlb/design-system';
import { ChevronRight, List, Plus, Tag, X } from 'lucide-react';
import { useSession } from '@/shared';
import { useCategories } from '@/modules/inventary/categories/hooks';
import { useProducts } from '@/modules/inventary/products/hooks';
import { usePriceLists } from '@/modules/inventary/price-lists/hooks';
import { TariffManagerModal } from '@/modules/inventary/price-lists/components/TariffManagerModal';
import {
  SETTINGS_CATEGORY_HASHES,
  SETTINGS_HOME_HASH,
} from '@/modules/settings/hooks';
import styles from './ProductConfigurationPanel.module.css';

type ColorValue = string | { name?: string; hex?: string; code?: string };

export const ProductConfigurationPanel = ({ onClose }: { onClose: () => void }) => {
  const organization = useSession((state) => state.organization);
  const { categories, isLoading: loadingCategories } = useCategories({ page: 1, limit: 100 });
  const { products, isLoading: loadingProducts } = useProducts({ page: 1, limit: 100 });
  const { priceLists, isLoading: loadingPrices } = usePriceLists();
  const { openModal, closeModal } = useModal();
  const variantGroups = useMemo(() => {
    const colors = new Map<string, string>();
    const sizes = new Set<string>();
    products.flatMap((product) => product.variants ?? []).forEach((variant) => {
      const color = variant.color as ColorValue | undefined;
      if (typeof color === 'string' && color.trim()) colors.set(color, color);
      else if (color && typeof color === 'object') {
        const code = color.hex || color.code || '';
        const name = color.name || code;
        if (name) colors.set(name, code);
      }
      if (variant.size?.trim()) sizes.add(variant.size.trim());
    });
    return [
      ...(colors.size ? [{ name: 'Color', values: [...colors.keys()] }] : []),
      ...(sizes.size ? [{ name: 'Talla', values: [...sizes] }] : []),
    ];
  }, [products]);
  const navigateHash = (hash: string) => window.location.assign(`#${hash}`);
  const openTariffs = () =>
    openModal(
      <TariffManagerModal closeModal={closeModal} selectedIds={[]} onChange={() => undefined} />,
      { id: 'inventory-price-lists' },
    );

  return (
    <div className={styles.overlay} role="presentation">
      <aside className={styles.panel} aria-label="Configuración de productos">
        <header className={styles.header}>
          <div><span>CONFIGURACIÓN</span><strong>{organization?.name || 'Mi organización'}</strong></div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </header>
        <main className={styles.content}>
          <nav className={styles.breadcrumb}>
            <button type="button" onClick={() => navigateHash(SETTINGS_HOME_HASH)}>Configuración</button>
            <ChevronRight size={16} />
            <button type="button" onClick={() => navigateHash(SETTINGS_CATEGORY_HASHES.inventory)}>Inventario</button>
            <ChevronRight size={16} /><span>Configuración de productos</span>
          </nav>

          <Section title="Categorías de producto" description="Crea grupos de categorías aplicables a tus productos para segmentarlos, filtrarlos y facilitar su clasificación." action="Nueva categoría" onAction={() => window.location.assign('/categories')}>
            <Rows loading={loadingCategories} empty="Aún no hay categorías">
              {categories.slice(0, 8).map((category) => <Row key={String(category.id)} icon={<List size={16} />} name={category.name} />)}
            </Rows>
          </Section>

          <Section title="Grupos de variantes" description="Agrupa las opciones de producto para artículos de índole similar." action="Nuevo grupo de variantes" onAction={() => window.location.assign('/products')}>
            <Rows loading={loadingProducts} empty="Los grupos aparecerán al añadir colores o tallas a tus productos">
              {variantGroups.map((group) => <Row key={group.name} icon={<List size={16} />} name={group.name} tags={group.values.slice(0, 6)} />)}
            </Rows>
          </Section>

          <Section title="Listas de precios" description="Crea listados para incluir tarifas especiales en tus productos." action="Nueva tarifa" onAction={openTariffs}>
            <Rows loading={loadingPrices} empty="Aún no hay listas de precios">
              {priceLists.map((priceList) => <Row key={String(priceList.id)} icon={<Tag size={16} />} name={priceList.name} tags={[priceList.currency || 'COP']} />)}
            </Rows>
          </Section>

          <Section title="Traducciones de productos" description="Configura los idiomas que aparecerán al crear productos o actualizarlos por Excel." action="Configurar traducciones" onAction={() => window.location.assign('/products')}>
            <Row icon={<Tag size={16} />} name="Español" tags={['Predeterminado']} />
          </Section>
        </main>
      </aside>
    </div>
  );
};

const Section = ({ title, description, action, onAction, children }: { title: string; description: string; action: string; onAction: () => void; children: ReactNode }) => (
  <section className={styles.section}>
    <div className={styles.sectionTop}><div><h2>{title}</h2><p>{description}</p></div><Button variant="outline" theme="optional" icon={<Plus size={16} />} onClick={onAction}>{action}</Button></div>
    <div className={styles.rows}>{children}</div>
  </section>
);
const Rows = ({ loading, empty, children }: { loading: boolean; empty: string; children: ReactNode }) => {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  if (loading) return <p className={styles.empty}>Cargando...</p>;
  return hasChildren ? children : <p className={styles.empty}>{empty}</p>;
};
const Row = ({ icon, name, tags = [] }: { icon: ReactNode; name: string; tags?: string[] }) => (
  <div className={styles.row}><span className={styles.rowIcon}>{icon}</span><strong>{name}</strong><div>{tags.map((tag) => <small key={tag}>{tag}</small>)}</div></div>
);
