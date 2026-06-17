import { Menus, type DataTableColumn } from '@hlb/design-system';
import type { BrandRow } from '../types';
import styles from '../screens/BrandsList/BrandsList.module.css';

type BrandColumnsOptions = {
  onEdit?: (row: BrandRow) => void;
  onDelete?: (row: BrandRow) => void;
};

export const brandColumns = ({ onDelete, onEdit }: BrandColumnsOptions = {}): DataTableColumn<BrandRow>[] => [
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
  { key: 'description', header: 'Descripción', width: 320 },
  { key: 'website', header: 'Sitio web', width: 220 },
  { key: 'position', header: 'Posición', width: 120, align: 'right' },
  {
    key: 'id',
    header: '',
    width: 56,
    align: 'right',
    render: (_value, row) => (
      <Menus defaultPlacement="bottom-end">
        <Menus.Menu>
          <Menus.Toggle id={`brand-actions-${row.id}`} aria-label={`Opciones de ${row.name}`} verticalIcon />
          <Menus.List id={`brand-actions-${row.id}`} placement="bottom-end">
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
