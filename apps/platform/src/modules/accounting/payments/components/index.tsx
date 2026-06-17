import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, Menus, Table, TextInput, Tooltip, type DataTableColumn } from '@hlb/design-system';
import { formatCurrency } from '@hlb/foundation';
import {
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Grid2X2Plus,
  Info,
  Landmark,
  List,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useContacts } from '@/modules/contacts/hooks';
import { usePaymentMethods } from '@/modules/settings/payment-methods/hooks';
import { useTreasuryAccounts } from '@/modules/treasury/accounts/hooks';
import { useCreatePayment, useDeletePayment } from '../hooks';
import type { CreatePaymentPayload, PaymentRow } from '../types';
import styles from '../screens/PaymentsList/PaymentsList.module.css';

type HeaderProps = {
  onCreatePayment: () => void;
};

export const Header = ({ onCreatePayment }: HeaderProps) => (
  <header className={styles.header}>
    <Tooltip content="Gestiona los pagos y cobros de la organización.">
      <h1 className={styles.titleGroup}>
        Pagos y Cobros
        <Info size={15} strokeWidth={1.5} aria-hidden="true" />
      </h1>
    </Tooltip>

    <div className={styles.headerActions}>
      <Button
        className={styles.iconButton}
        variant="outline"
        theme="optional"
        size="medium"
        icon={<Grid2X2Plus size={16} />}
        aria-label="Cambiar vista"
      />
      <Button size="medium" onClick={onCreatePayment}>
        Nuevo pago <span className={styles.shortcut}>N</span>
      </Button>
    </div>
  </header>
);

type ToolbarProps = {
  query: string;
  status: string;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export const Toolbar = ({ onQueryChange, onStatusChange, query, status }: ToolbarProps) => (
  <div className={styles.toolbar}>
    <div className={styles.toolbarLeft}>
      <label className={styles.selectLabel}>
        <span>Estado</span>
        <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="all">Todos</option>
          <option value="unassigned">Pendientes</option>
          <option value="assigned">Asignados</option>
          <option value="partial">Parciales</option>
        </select>
      </label>

      <button className={styles.filterButton} type="button">
        + Filtro
      </button>
    </div>

    <div className={styles.toolbarRight}>
      <TextInput
        className={styles.searchField}
        label="Buscar pago"
        labelHidden
        icon={<Search size={16} />}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />

      <span className={styles.dateRange}>
        <CalendarDays size={15} />
        31/12/2025 - 30/12/2026
      </span>

      <Button
        className={styles.iconButton}
        variant="outline"
        theme="optional"
        size="medium"
        icon={<CloudUpload size={17} />}
        aria-label="Importar pagos"
      />
    </div>
  </div>
);

type PaymentsTableProps = {
  rows: PaymentRow[];
  error: unknown;
  isLoading: boolean;
  hasPayments: boolean;
  refetch: () => void;
  onCreatePayment: () => void;
  onOpenPayment: (row: PaymentRow) => void;
};

export const PaymentsTable = ({
  error,
  hasPayments,
  isLoading,
  onCreatePayment,
  onOpenPayment,
  refetch,
  rows,
}: PaymentsTableProps) => {
  const { deletePayment } = useDeletePayment();
  const columns = useMemo<DataTableColumn<PaymentRow>[]>(
    () => [
      { key: 'date', header: 'Fecha', sortable: true, width: 140 },
      {
        key: 'direction',
        header: 'Tipo',
        width: 110,
        render: (value) => (value === 'outflow' ? 'Pago' : 'Cobro'),
      },
      { key: 'createdAt', header: 'Creado', width: 190 },
      { key: 'contactName', header: 'Contacto', width: 230 },
      {
        key: 'account',
        header: 'Cuenta',
        width: 210,
        render: (value) => (
          <span className={styles.accountCell}>
            <Landmark size={14} />
            {String(value)}
          </span>
        ),
      },
      { key: 'description', header: 'Descripción', width: 260 },
      {
        key: 'total',
        header: 'Total',
        width: 150,
        align: 'right',
        render: (value, row) => (
          <span className={row.direction === 'outflow' ? styles.moneyNegative : styles.moneyPositive}>
            {row.direction === 'outflow' ? '-' : '+'}
            {formatCurrency(Number(value ?? 0))}
          </span>
        ),
      },
      {
        key: 'feeAmount',
        header: 'Comisión',
        width: 140,
        align: 'right',
        render: (value) => formatCurrency(Number(value ?? 0)),
      },
      {
        key: 'netAmount',
        header: 'Neto',
        width: 150,
        align: 'right',
        render: (value) => <strong>{formatCurrency(Number(value ?? 0))}</strong>,
      },
      {
        key: 'status',
        header: 'Estado',
        width: 130,
        render: (value, row) => (
          <span className={`${styles.statusBadge} ${styles[`status${row.statusTone[0].toUpperCase()}${row.statusTone.slice(1)}`]}`}>
            {String(value)}
          </span>
        ),
      },
      {
        key: 'reconciliationStatus',
        header: 'Conciliado',
        width: 130,
        render: (value, row) => (
          <span className={`${styles.statusBadge} ${styles[`status${row.reconciliationTone[0].toUpperCase()}${row.reconciliationTone.slice(1)}`]}`}>
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
              <Menus.Toggle id={`payment-actions-${row.id}`} aria-label={`Opciones de ${row.description}`} verticalIcon />
              <Menus.List id={`payment-actions-${row.id}`} placement="bottom-end">
                <Menus.Item id={`view-${row.id}`} onClick={() => onOpenPayment(row)}>
                  Ver
                </Menus.Item>
                <Menus.Item id={`edit-${row.id}`} onClick={() => onOpenPayment(row)}>
                  Editar
                </Menus.Item>
                <Menus.Item id={`delete-${row.id}`} danger onClick={() => deletePayment(row.id)}>
                  Eliminar
                </Menus.Item>
              </Menus.List>
            </Menus.Menu>
          </Menus>
        ),
      },
    ],
    [deletePayment, onOpenPayment],
  );

  if (error) {
    return (
      <div className={styles.feedback} role="alert">
        <strong>No pudimos cargar tus pagos.</strong>

        <Button variant="outline" size="medium" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!hasPayments && !isLoading) {
    return <PaymentsEmptyState onCreatePayment={onCreatePayment} />;
  }

  return (
    <div className={styles.tableWrap}>
      <Table
        ariaLabel="Pagos y cobros"
        columns={columns}
        rows={rows}
        pageSize={rows.length}
        selectionMode="multi"
        defaultSort={{ key: 'date', dir: 'desc' }}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        loadingText="Cargando pagos..."
        emptyText={hasPayments ? 'No hay pagos para mostrar' : 'No hay pagos registrados'}
      />

      <div className={styles.columnMenu} aria-hidden="true">
        <List size={16} />
      </div>
    </div>
  );
};

type PaymentsEmptyStateProps = {
  onCreatePayment: () => void;
};

const PaymentsEmptyState = ({ onCreatePayment }: PaymentsEmptyStateProps) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIllustration} aria-hidden="true">
      <span className={styles.emptyCircle} />
      <span className={styles.emptyCard}>
        <i />
        <i />
        <i />
        <strong />
      </span>
    </div>
    <h2>Pagos &amp; Cobros</h2>
    <p>Añade tu primer pago/cobro</p>
    <Button size="medium" onClick={onCreatePayment}>
      Nuevo pago
    </Button>
  </div>
);

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export const Pagination = ({
  endItem,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  startItem,
  total,
}: PaginationProps) => {
  const pages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <footer className={styles.footer}>
      <div className={styles.paginationLeft}>
        <strong>
          {startItem} - {endItem} ({total})
        </strong>
        <label className={styles.pageSize}>
          <span>Filas por página</span>
          <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>
      <div className={styles.paginationRight}>
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior">
          <ChevronLeft size={16} />
        </button>
        <strong>{page}</strong>
        <button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Página siguiente">
          <ChevronRight size={16} />
        </button>
      </div>
    </footer>
  );
};

type PaymentFormState = {
  amount: string;
  bankAccountId: string;
  contactId: string;
  contactName: string;
  date: string;
  description: string;
  direction: NonNullable<CreatePaymentPayload['direction']>;
  documentId: string;
  documentType: string;
  supportFile?: CreatePaymentPayload['supportFile'];
};

const today = () => new Date().toISOString().slice(0, 10);

const initialFormState: PaymentFormState = {
  amount: '0',
  bankAccountId: '',
  contactId: '',
  contactName: '',
  date: today(),
  description: '',
  direction: 'inflow',
  documentId: '',
  documentType: '',
};

type PaymentFormModalProps = {
  initialValues?: Partial<PaymentFormState>;
  onClose: () => void;
};

export const PaymentFormModal = ({ initialValues, onClose }: PaymentFormModalProps) => {
  const { createPayment, isCreatingPayment } = useCreatePayment();
  const { contacts } = useContacts({ page: 1, limit: 100, scope: 'all' });
  const { paymentMethods } = usePaymentMethods({ page: 1, limit: 100 });
  const { accounts: bankingAccounts, isLoading: isLoadingBankingAccounts } = useTreasuryAccounts({
    kind: 'bank',
    limit: 100,
  });
  const [formState, setFormState] = useState<PaymentFormState>({
    ...initialFormState,
    ...initialValues,
    date: initialValues?.date ?? initialFormState.date,
    direction: initialValues?.direction ?? initialFormState.direction,
  });
  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find(
        (method) =>
          String(method.bankingAccountId || '') === formState.bankAccountId ||
          String(method.id) === formState.bankAccountId,
      ),
    [formState.bankAccountId, paymentMethods],
  );
  const grossAmount = Number(formState.amount || 0);
  const feeType = selectedPaymentMethod?.financialFeeType ?? 'none';
  const feeValue = Number(selectedPaymentMethod?.financialFeeValue ?? 0);
  const feeAmount =
    feeType === 'fixed'
      ? feeValue
      : feeType === 'custom'
        ? feeValue
      : feeType === 'percentage'
        ? grossAmount * (feeValue / 100)
        : 0;
  const netAmount =
    formState.direction === 'outflow'
      ? grossAmount + feeAmount
      : Math.max(grossAmount - feeAmount, 0);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const updateSupport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setFormState((current) => ({
      ...current,
      supportFile: file
        ? {
            name: file.name,
            type: file.type,
            size: file.size,
          }
        : undefined,
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const contact = contacts.find((item) => String(item.id) === formState.contactId);

    createPayment(
      {
        amount: Number(formState.amount || 0),
        bankAccountId: formState.bankAccountId,
        paymentMethodId: selectedPaymentMethod ? String(selectedPaymentMethod.id) : undefined,
        financialFeePaymentMethodId:
          selectedPaymentMethod?.financialFeeType && selectedPaymentMethod.financialFeeType !== 'none'
            ? String(selectedPaymentMethod.id)
            : undefined,
        feeName:
          selectedPaymentMethod?.financialFeeType && selectedPaymentMethod.financialFeeType !== 'none'
            ? selectedPaymentMethod.name
            : undefined,
        feeType: selectedPaymentMethod?.financialFeeType ?? 'none',
        feeValue:
          selectedPaymentMethod?.financialFeeType && selectedPaymentMethod.financialFeeType !== 'none'
            ? Number(selectedPaymentMethod.financialFeeValue ?? 0)
            : 0,
        contactId: formState.contactId,
        contactName: contact?.name ?? formState.contactName,
        date: new Date(formState.date).toISOString(),
        description: formState.description || 'Pago',
        direction: formState.direction,
        documentId: formState.documentId || undefined,
        documentType: formState.documentType as CreatePaymentPayload['documentType'],
        supportFile: formState.supportFile,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className={styles.modalOverlay} role="presentation">
      <section className={styles.modal} role="dialog" aria-modal="true" aria-label="Nuevo pago">
        <header className={styles.modalHeader}>
          <h2>Nuevo</h2>
          <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formGrid}>
            <TextInput
              label="Fecha"
              name="date"
              type="date"
              value={formState.date}
              fullWidth
              onChange={updateField}
            />
            <label className={styles.selectField}>
              <span>Tipo</span>
              <select name="direction" value={formState.direction} onChange={updateField}>
                <option value="inflow">Cobro</option>
                <option value="outflow">Pago</option>
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Contacto</span>
              <select name="contactId" value={formState.contactId} onChange={updateField}>
                <option value="">Seleccionar contacto</option>
                {contacts.map((contact) => (
                  <option key={String(contact.id)} value={String(contact.id)}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Banco</span>
              <select name="bankAccountId" value={formState.bankAccountId} onChange={updateField}>
                <option value="">
                  {isLoadingBankingAccounts ? 'Cargando bancos...' : 'No asignado'}
                </option>
                {bankingAccounts.map((account) => (
                  <option key={String(account.id)} value={String(account.id)}>
                    {account.bankName || account.name}
                    {account.accountNumber ? ` · ${account.accountNumber}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.formGridTwo}>
            <TextInput
              label="Descripción"
              name="description"
              placeholder="Introduce la descripción..."
              value={formState.description}
              fullWidth
              onChange={updateField}
            />
            <TextInput
              label="Importe"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formState.amount}
              fullWidth
              onChange={updateField}
            />
          </div>

          {feeAmount > 0 && (
            <div className={styles.feePreview}>
              <span>
                Comisión del método de pago
                <strong>{formatCurrency(feeAmount)}</strong>
              </span>
              <span>
                {formState.direction === 'outflow' ? 'Salida total' : 'Neto recibido'}
                <strong>{formatCurrency(netAmount)}</strong>
              </span>
            </div>
          )}

          <label className={styles.supportField}>
            <span>Soporte del pago</span>
            <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={updateSupport} />
            {formState.supportFile?.name && (
              <span className={styles.supportName}>{formState.supportFile.name}</span>
            )}
          </label>

          <footer className={styles.modalFooter}>
            <Button type="button" theme="optional" variant="outline" size="medium" icon={<Search size={16} />}>
              Relacionar con un pago existente
            </Button>
            <div className={styles.modalFooterRight}>
              <Button type="button" theme="optional" variant="outline" size="medium" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" size="medium" loading={isCreatingPayment}>
                Crear
              </Button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
};

type PaymentDetailsModalProps = {
  row: PaymentRow;
  onClose: () => void;
};

export const PaymentDetailsModal = ({ onClose, row }: PaymentDetailsModalProps) => (
  <div className={styles.modalOverlay} role="presentation">
    <section className={styles.modal} role="dialog" aria-modal="true" aria-label="Detalle del pago">
      <header className={styles.modalHeader}>
        <h2>Pago</h2>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>
      </header>

      <div className={styles.detailSummary}>
        <div>
          <span>Fecha</span>
          <strong>{row.date}</strong>
          <span>Contacto</span>
          <strong>{row.contactName}</strong>
        </div>
        <div>
          <span>Descripción</span>
          <strong>{row.description}</strong>
          <span>Cuenta</span>
          <strong>{row.account}</strong>
        </div>
        <strong className={row.direction === 'outflow' ? styles.detailTotalNegative : styles.detailTotal}>
          {row.direction === 'outflow' ? '-' : '+'}
          {formatCurrency(row.total)}
        </strong>
      </div>

      <div className={styles.feeDetails}>
        <span>
          {row.direction === 'outflow' ? 'Bruto pagado' : 'Bruto aplicado'}
          <strong>{formatCurrency(row.total)}</strong>
        </span>
        <span>
          Comisión
          <strong>{formatCurrency(row.feeAmount)}</strong>
        </span>
        <span>
          {row.direction === 'outflow' ? 'Salida total' : 'Neto recibido'}
          <strong>{formatCurrency(row.netAmount)}</strong>
        </span>
      </div>

      <div className={styles.documentsBlock}>
        <h3>Documentos</h3>
        <table className={styles.documentsTable}>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{row.source.documentId ? row.description : 'Pago no relacionado a documento'}</td>
              <td>{formatCurrency(row.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer className={styles.modalFooter}>
        <Button type="button" theme="optional" variant="outline" size="medium" icon={<Trash2 size={16} />}>
          Eliminar
        </Button>
        <div className={styles.modalFooterRight}>
          <Button type="button" theme="optional" variant="outline" size="medium" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" size="medium" icon={<Banknote size={16} />}>
            Editar
          </Button>
        </div>
      </footer>
    </section>
  </div>
);
