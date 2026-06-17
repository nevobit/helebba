import { Menus, type DataTableColumn } from '@hlb/design-system';
import { formatCurrency } from '@hlb/foundation';
import { LockKeyhole } from 'lucide-react';
import type { DocumentRow } from '../types';
import styles from '../screens/DocumentList/DocumentList.module.css';

type DocumentColumnsOptions = {
  onOpen?: (row: DocumentRow) => void;
  onEdit?: (row: DocumentRow) => void;
  onDelete?: (row: DocumentRow) => void;
  onCancel?: (row: DocumentRow) => void;
};

const money = (value: unknown) => formatCurrency(Number(value ?? 0));

const documentTypeLabel = (docType?: string) => {
  if (docType === 'estimate') return 'Presupuesto';
  if (docType === 'purchase') return 'Compra';

  return 'Factura';
};

export const documentColumns = ({
  onCancel,
  onDelete,
  onEdit,
  onOpen,
}: DocumentColumnsOptions = {}): DataTableColumn<DocumentRow>[] => [
  { key: 'date', header: 'Fecha', sortable: true, width: 120 },
  {
    key: 'docNumber',
    header: 'Num',
    sortable: true,
    width: 130,
    render: (value, row) => (
      <span className={styles.documentNumber}>
        <strong>
          {String(value)} <LockKeyhole size={13} color="#10b981" />
        </strong>
        <span>{documentTypeLabel(row.source.docType)}</span>
      </span>
    ),
  },
  { key: 'operationDate', header: 'Fecha operación', width: 150 },
  { key: 'dueDate', header: 'Vencimiento', width: 140 },
  { key: 'contactName', header: 'Cliente', width: 160 },
  { key: 'description', header: 'Descripción', width: 230 },
  { key: 'tags', header: 'Tags', width: 130 },
  {
    key: 'account',
    header: 'Cuenta',
    width: 170,
    render: (value) => (
      <span className={styles.accountCell}>
        <i />
        {String(value)}
      </span>
    ),
  },
  { key: 'paymentMethod', header: 'F.Pago', width: 180 },
  { key: 'project', header: 'Proyecto', width: 130 },
  { key: 'subtotal', header: 'Subtotal', width: 140, align: 'right', render: money },
  { key: 'tax', header: 'IVA', width: 120, align: 'right', render: money },
  { key: 'total', header: 'Total', width: 130, align: 'right', render: money },
  {
    key: 'status',
    header: 'Estado',
    width: 120,
    render: (value, row) => (
      <span className={`${styles.statusBadge} ${styles[`status${row.statusTone[0].toUpperCase()}${row.statusTone.slice(1)}`]}`}>
        {String(value)}
      </span>
    ),
  },
  {
    key: 'id',
    header: '',
    width: 52,
    align: 'right',
    headerAriaLabel: 'Acciones',
    render: (_value, row) => (
      <Menus defaultPlacement="bottom-end">
        <Menus.Menu>
          <Menus.Toggle id={`document-actions-${row.id}`} aria-label={`Opciones de ${row.docNumber}`} verticalIcon />
          <Menus.List id={`document-actions-${row.id}`} placement="bottom-end">
            <Menus.Item id={`view-${row.id}`} onClick={() => onOpen?.(row)}>
              Ver
            </Menus.Item>
            <Menus.Item id={`edit-${row.id}`} onClick={() => onEdit?.(row)}>
              Editar
            </Menus.Item>
            <Menus.Item id={`duplicate-${row.id}`}>Duplicar</Menus.Item>
            <Menus.Item id={`delete-${row.id}`} danger onClick={() => onDelete?.(row)}>
              Eliminar
            </Menus.Item>
            <Menus.Item id={`cancel-${row.id}`} danger onClick={() => onCancel?.(row)}>
              Anular
            </Menus.Item>
          </Menus.List>
        </Menus.Menu>
      </Menus>
    ),
  },
];
