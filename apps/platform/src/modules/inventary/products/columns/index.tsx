import type { DataTableColumn } from '@hlb/design-system';
import type { ProductRow } from '../types';
import styles from '../screens/ProductsList/ProductsList.module.css';
import { ProductActions } from './ProductActions';
import { formatCurrency } from '@hlb/foundation';

const money = (value: unknown) => `${formatCurrency(Number(value ?? 0))}`;

export const productColumns: DataTableColumn<ProductRow>[] = [
  {
    key: 'createdAt',
    header: 'Creado',
    width: 104,
    render: (value, row) => (
      <span className={styles.createdCell}>
        <span className={styles.initials}>{row.initials}</span>
        <span>{String(value)}</span>
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Nombre',
    sortable: true,
    width: 170,
    render: (value) => <strong className={styles.nameCell}>{String(value)}</strong>,
  },
  { key: 'description', header: 'Descripción', width: 150 },
  { key: 'warehouse', header: 'Bodega', width: 136 },
  {
    key: 'channel',
    header: 'Canal',
    width: 158,
    render: (value) => (
      <span className={styles.channelCell}>
        <i />
        {String(value)}
      </span>
    ),
  },
  { key: 'stock', header: 'Stock', width: 50, align: 'right' },
  { key: 'purchasePrice', header: 'Precio de compra', width: 150, align: 'right', render: money },
  { key: 'cost', header: 'Valor de costo', width: 142, align: 'right', render: money },
  { key: 'salesValue', header: 'Valor de ventas', width: 150, align: 'right', render: money },
  { key: 'subtotal', header: 'Subtotal', width: 116, align: 'right', render: money },
  {
    key: 'salesTax',
    header: 'Impuesto',
    width: 198,
    align: 'right',
    render: money,
  },
  { key: 'total', header: 'Total', width: 112, align: 'right', render: money },
  {
    key: 'actions',
    header: '',
    width: 20,
    align: 'right',
    headerAriaLabel: 'Acciones',
    render: (_value, row) => <ProductActions product={row} />,
  },
];
