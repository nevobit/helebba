import type { DataTableColumn } from '@hlb/design-system';
import { Menus } from '@hlb/design-system';
import type { CategoryRow } from '../types';
import styles from '../screens/ProductsList/ProductsList.module.css';

type CategoryColumnsOptions = {
  onEdit?: (row: CategoryRow) => void;
  onDelete?: (row: CategoryRow) => void;
};

export const categoryColumns = ({
  onDelete,
  onEdit,
}: CategoryColumnsOptions = {}): DataTableColumn<CategoryRow>[] => [
  {
    key: 'createdAt',
    header: 'Creado',
    width: 112,
    render: (value, row) => (
      <span className={styles.createdCell}>
        <span className={styles.initials} style={{ backgroundColor: row.color }}>
          {row.initials}
        </span>
        <span>{String(value)}</span>
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Nombre',
    sortable: true,
    width: 260,
    render: (value) => <strong className={styles.nameCell}>{String(value)}</strong>,
  },
  { key: 'type', header: 'Tipo', width: 160 },
  { key: 'options', header: 'Opciones', width: 320 },
  { key: 'showInCatalog', header: 'Catálogo', width: 130 },
  { key: 'position', header: 'Posición', width: 120, align: 'right' },
  {
    key: 'id',
    header: '',
    width: 56,
    align: 'right',
    render: (_value, row) => (
      <Menus defaultPlacement="bottom-end">
        <Menus.Menu>
          <Menus.Toggle id={`category-actions-${row.id}`} aria-label={`Opciones de ${row.name}`} verticalIcon />
          <Menus.List id={`category-actions-${row.id}`} placement="bottom-end">
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
