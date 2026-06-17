import type { DataTableColumn } from '@hlb/design-system';
import type { ContactRow } from '../types';
import styles from '../screens/ContactsList/ContactsList.module.css';

export const contactColumns: DataTableColumn<ContactRow>[] = [
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
    width: 220,
    render: (value) => <strong className={styles.nameCell}>{String(value)}</strong>,
  },
  { key: 'code', header: 'ID', width: 104 },
  { key: 'email', header: 'Correo electrónico', width: 180 },
  { key: 'phone', header: 'Teléfono', width: 120 },
  { key: 'mobile', header: 'Móvil', width: 120 },
  { key: 'address', header: 'Dirección', width: 150 },
  { key: 'city', header: 'Ciudad', width: 110 },
  { key: 'postalCode', header: 'Código postal', width: 140 },
  { key: 'department', header: 'Departamento', width: 140 },
  { key: 'tags', header: 'Tags', width: 130 },
  {
    key: 'kind',
    header: 'Tipo',
    width: 116,
    render: (value) =>
      value ? <span className={styles.kindBadge}>{String(value)}</span> : <span aria-hidden="true" />,
  },
  { key: 'portalVisibility', header: 'Visibilidad del portal', width: 176 },
];
