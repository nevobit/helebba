import { useMemo, useState } from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import { Box, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { formatCurrency } from '@hlb/foundation';
import { useProducts } from '@/modules/inventary/products/hooks';
import { useServices } from '@/modules/sales/services/hooks';
import type { DocumentLineForm } from '../../types';
import styles from './ItemSelectorModal.module.css';

type ItemSelectorModalProps = {
  onClose: () => void;
  onSelect: (line: DocumentLineForm) => void;
};

export const ItemSelectorModal = ({ onClose, onSelect }: ItemSelectorModalProps) => {
  const [query, setQuery] = useState('');
  const [recentItemId, setRecentItemId] = useState<string | null>(null);
  const { products } = useProducts({ page: 1, limit: 15, search: query });
  const { services } = useServices({ page: 1, limit: 15, search: query });

  const items = useMemo(() => {
    const getProductTax = (taxes?: string[]) => {
      const firstTax = taxes?.[0] ?? '';
      const match = firstTax.match(/(\d+(?:[,.]\d+)?)\s*%/);

      return match ? Number(match[1].replace(',', '.')) : 0;
    };

    const productItems = products.map((product) => ({
      id: String(product.id),
      type: 'product' as const,
      typeLabel: 'Producto',
      productId: String(product.id),
      serviceId: '',
      name: product.name,
      sku: product.sku || product.barcode || product.name.toLowerCase().replace(/\s+/g, '-'),
      description: product.description,
      stock: Number(product.stock ?? 0),
      virtualStock: Number(product.stock ?? 0),
      availableStock: Number(product.stock ?? 0),
      price: Number(product.price ?? 0),
      tax: getProductTax(product.taxes),
    }));

    const serviceItems = services.map((service) => ({
      id: String(service.id),
      type: 'service' as const,
      typeLabel: 'Servicio',
      productId: '',
      serviceId: String(service.id),
      name: service.name,
      sku: service.code || service.name.toLowerCase().replace(/\s+/g, '-'),
      description: service.description,
      stock: 0,
      virtualStock: 0,
      availableStock: 0,
      price: Number(service.price ?? 0),
      tax: Number(service.tax ?? 21),
    }));
    const mapped = [...productItems, ...serviceItems];

    if (mapped.length > 0) return mapped;

    return [
      {
        id: 'sample-maintenance',
        type: 'service' as const,
        typeLabel: 'Servicio',
        productId: '',
        serviceId: 'sample-maintenance',
        name: 'Mantenimiento',
        sku: 'mantenimiento',
        description: 'mantenimiento de pcs',
        stock: 0,
        virtualStock: 0,
        availableStock: 0,
        price: 90000,
        tax: 21,
      },
    ];
  }, [products, services]);

  return (
    <Modal.Window
      isOpen
      ariaLabel="Selecciona los items"
      className={styles.modal}
      closeOnEsc
      closeOnOverlay
      onClose={onClose}
      size={{ width: '130rem', maxWidth: 'calc(100vw - 4rem)' }}
    >
      <Modal.Header className={styles.header}>
        <h2>Selecciona los items</h2>
        <Modal.CloseButton onClick={onClose} label="Cerrar" />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        <div className={styles.filters}>
          <TextInput
            className={styles.search}
            label="Buscar"
            labelHidden
            placeholder="Buscar"
            icon={<Search size={16} />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className={styles.filterButton} type="button">
            + Filtros
          </button>
        </div>

        <div className={styles.options}>
          <label className={styles.selectField}>
            <span>Tarifa</span>
            <select defaultValue="main">
              <option value="main">Tarifa principal</option>
            </select>
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" defaultChecked /> Añade los artículos iguales en la misma línea
          </label>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Tipo</th>
                <th>SKU</th>
                <th>Descripción</th>
                <th>Cód. barras</th>
                <th>Stock</th>
                <th>S. Virtual</th>
                <th>S. Disponible</th>
                <th>Precio venta</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={recentItemId === item.id ? styles.recentRow : undefined}>
                  <td>
                    <button
                      className={styles.itemButton}
                      type="button"
                      aria-label={`Añadir ${item.name}`}
                      onClick={() => {
                        onSelect({
                          id: crypto.randomUUID(),
                          itemType: item.type,
                          productId: item.productId,
                          serviceId: item.serviceId,
                          sku: item.sku,
                          concept: item.name,
                          description: item.description,
                          quantity: '1',
                          price: String(item.price),
                          tax: String(item.tax),
                        });
                        setRecentItemId(item.id);
                      }}
                    >
                      <Box size={16} />
                    </button>{' '}
                    {item.name}
                  </td>
                  <td>{item.typeLabel}</td>
                  <td>{item.sku}</td>
                  <td>{item.description}</td>
                  <td>-</td>
                  <td>{item.stock}</td>
                  <td>{item.virtualStock}</td>
                  <td>{item.availableStock}</td>
                  <td>{formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>

      <footer className={styles.footer}>
        <Button className={styles.iconButton} variant="ghost" theme="optional" size="medium" icon={<ChevronLeft size={16} />} aria-label="Página anterior" />
        <span className={styles.page}>1 - {items.length} ({items.length})</span>
        <Button className={styles.iconButton} variant="ghost" theme="optional" size="medium" icon={<ChevronRight size={16} />} aria-label="Página siguiente" />
      </footer>
    </Modal.Window>
  );
};
