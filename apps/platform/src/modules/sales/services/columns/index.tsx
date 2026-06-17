import { Menus, type DataTableColumn } from '@hlb/design-system';
import { formatCurrency } from '@hlb/foundation';
import type { ServiceRow } from '../types';
import styles from '../screens/ServicesList/ServicesList.module.css';

const money = (value: unknown) => formatCurrency(Number(value ?? 0));

type ServiceColumnsOptions = {
  onDelete?: (row: ServiceRow) => void;
  onEdit?: (row: ServiceRow) => void;
};

export const serviceColumns = ({
  onDelete,
  onEdit,
}: ServiceColumnsOptions = {}): DataTableColumn<ServiceRow>[] => [
  {
    key: 'name',
    header: 'Nombre',
    sortable: true,
    width: 260,
    render: (value, row) => (
      <span className={styles.nameWithAvatar}>
        <span className={styles.initials} style={{ backgroundColor: row.color }}>
          {row.initials}
        </span>
        <strong className={styles.nameCell}>{String(value)}</strong>
      </span>
    ),
  },
  { key: 'description', header: 'Descripción', width: 230 },
  { key: 'tags', header: 'Tags', width: 130 },
  { key: 'code', header: 'Código', width: 170 },
  {
    key: 'account',
    header: 'Cuenta',
    width: 190,
    render: (value) => (
      <span className={styles.accountCell}>
        <i />
        {String(value)}
      </span>
    ),
  },
  { key: 'subtotal', header: 'Subtotal', width: 150, align: 'right', render: money },
  { key: 'cost', header: 'Coste', width: 150, align: 'right', render: money },
  { key: 'tax', header: 'IVA', width: 160, align: 'right', render: money },
  { key: 'recurring', header: 'Retencion', width: 160, align: 'right', render: money },
  { key: 'total', header: 'Total', width: 150, align: 'right', render: money },
  {
    key: 'id',
    header: '',
    width: 56,
    align: 'right',
    headerAriaLabel: 'Acciones',
    render: (_value, row) => (
      <Menus defaultPlacement="bottom-end">
        <Menus.Menu>
          <Menus.Toggle
            id={`service-actions-${row.id}`}
            aria-label={`Opciones de ${row.name}`}
            verticalIcon
          />
          <Menus.List id={`service-actions-${row.id}`} placement="bottom-end">
            <Menus.Item id={`view-${row.id}`}>Ver</Menus.Item>
            <Menus.Item id={`edit-${row.id}`} onClick={() => onEdit?.(row)}>
              Editar
            </Menus.Item>
            <Menus.Item id={`delete-${row.id}`} danger onClick={() => onDelete?.(row)}>
              Eliminar
            </Menus.Item>
          </Menus.List>
        </Menus.Menu>
      </Menus>
    ),
  },
];
