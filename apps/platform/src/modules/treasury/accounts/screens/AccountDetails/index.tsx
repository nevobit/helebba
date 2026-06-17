import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CloudUpload,
  Copy,
  Filter,
  PlugZap,
  Plus,
  Search,
} from 'lucide-react';
import { Button, Menus, Modal, TextInput, Tooltip } from '@hlb/design-system';
import { formatCurrency } from '@hlb/foundation';
import type { TreasuryAccountKind, TreasuryMovement } from '@hlb/contracts';
import {
  useArchiveTreasuryAccount,
  useCreateBankMovement,
  useCreateCashMovement,
  useDeleteTreasuryAccount,
  useReconcileBankMovement,
  useTreasuryAccount,
  useTreasuryMovements,
} from '../../hooks';
import styles from '../AccountsList/AccountsList.module.css';

type MovementFormState = {
  date: string;
  description: string;
  amount: string;
  direction: 'inflow' | 'outflow';
  reference: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const initialMovementForm: MovementFormState = {
  date: today(),
  description: '',
  amount: '',
  direction: 'inflow',
  reference: '',
};

const money = (value: number, currency = 'COP') =>
  formatCurrency(Number(value ?? 0), {
    currency,
    maximumFractionDigits: 0,
  });

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const getAccountMark = (kind: TreasuryAccountKind, name: string, bankName?: string) =>
  kind === 'cash' ? 'CJ' : (bankName || name || 'BA').slice(0, 2).toUpperCase();

const MovementModal = ({
  accountId,
  accountKind,
  isOpen,
  onClose,
}: {
  accountId: string;
  accountKind: TreasuryAccountKind;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [formState, setFormState] = useState<MovementFormState>(initialMovementForm);
  const [error, setError] = useState<string | null>(null);
  const bankMutation = useCreateBankMovement();
  const cashMutation = useCreateCashMovement();
  const createMovement = accountKind === 'cash' ? cashMutation.createMovement : bankMutation.createMovement;
  const isCreatingMovement = bankMutation.isCreatingMovement || cashMutation.isCreatingMovement;

  const close = () => {
    setFormState(initialMovementForm);
    setError(null);
    onClose();
  };

  const updateField = (field: keyof MovementFormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!formState.date || !formState.description.trim() || !formState.amount) {
      setError('Ingresa fecha, descripción e importe.');
      return;
    }

    createMovement(
      {
        accountId,
        payload: {
          date: new Date(formState.date).toISOString() as TreasuryMovement['date'],
          description: formState.description.trim(),
          amount: Number(formState.amount),
          direction: formState.direction,
          reference: formState.reference.trim() || undefined,
        },
      },
      {
        onSuccess: close,
        onError: (err) => setError(err instanceof Error ? err.message : 'No pudimos crear el movimiento.'),
      },
    );
  };

  return (
    <Modal.Window
      isOpen={isOpen}
      ariaLabel="Nuevo movimiento manual"
      className={styles.modal}
      closeStrategy="manual"
      closeOnOverlay
      closeOnEsc
      onClose={onClose}
      onRequestClose={close}
      size={{ width: '64rem', maxWidth: 'calc(100vw - 4rem)' }}
    >
      <Modal.Header className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Nuevo movimiento manual</h2>
        <Modal.CloseButton onClick={close} label="Cerrar" />
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <form id="treasury-movement-form" onSubmit={submit}>
          <div className={styles.formGrid}>
            <TextInput
              label="Fecha"
              type="date"
              required
              value={formState.date}
              onChange={(event) => updateField('date', event.target.value)}
            />
            <label className={styles.selectField}>
              <span>Tipo</span>
              <select
                value={formState.direction}
                onChange={(event) => updateField('direction', event.target.value as MovementFormState['direction'])}
              >
                <option value="inflow">Entrada</option>
                <option value="outflow">Salida</option>
              </select>
            </label>
            <TextInput
              label="Descripción"
              required
              value={formState.description}
              error={error ?? undefined}
              onChange={(event) => updateField('description', event.target.value)}
            />
            <TextInput
              label="Importe"
              type="number"
              min="0"
              step="0.01"
              required
              value={formState.amount}
              onChange={(event) => updateField('amount', event.target.value)}
            />
            <TextInput
              label="Referencia"
              value={formState.reference}
              onChange={(event) => updateField('reference', event.target.value)}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <Button variant="outline" theme="optional" size="medium" onClick={close}>
          Cancelar
        </Button>
        <Button form="treasury-movement-form" type="submit" size="medium" loading={isCreatingMovement}>
          Crear movimiento
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};

const AccountDetails = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [showMovementModal, setShowMovementModal] = useState(false);
  const { account, isLoading } = useTreasuryAccount(accountId);
  const { movements } = useTreasuryMovements(accountId, account?.kind ?? 'bank');
  const { reconcileMovement, isReconcilingMovement } = useReconcileBankMovement();
  const { archiveAccount, isArchivingAccount } = useArchiveTreasuryAccount();
  const { deleteAccount, isDeletingAccount } = useDeleteTreasuryAccount();

  const pendingMovements = movements.filter((movement) => movement.reconciliationStatus !== 'reconciled');
  const inflow = movements
    .filter((movement) => movement.direction === 'inflow')
    .reduce((sum, movement) => sum + Number(movement.amount ?? 0), 0);
  const outflow = movements
    .filter((movement) => movement.direction === 'outflow')
    .reduce((sum, movement) => sum + Number(movement.amount ?? 0), 0);

  if (!accountId) return null;

  if (isLoading || !account) {
    return (
      <main className={styles.page}>
        <p className={styles.muted}>Cargando cuenta...</p>
      </main>
    );
  }

  const archiveCurrent = () => {
    if (!window.confirm(`¿Archivar "${account.name}"?`)) return;
    archiveAccount(accountId, { onSuccess: () => navigate('/bank-accounts') });
  };

  const deleteCurrent = () => {
    if (!window.confirm(`¿Eliminar "${account.name}"?`)) return;
    deleteAccount(accountId, { onSuccess: () => navigate('/bank-accounts') });
  };

  return (
    <main className={styles.page}>
      <title>{account.name} - Helebba</title>
      <header className={styles.header}>
        <div className={styles.detailTitle}>
          <Button
            className={styles.iconButton}
            variant="plain"
            theme="optional"
            size="medium"
            icon={<ArrowLeft size={18} />}
            aria-label="Volver a cuentas"
            onClick={() => navigate('/bank-accounts')}
          />
          <span className={styles.logoMark}>{getAccountMark(account.kind, account.name, account.bankName)}</span>
          <h1 className={styles.titleGroup}>{account.name}</h1>
        </div>
        <div className={styles.detailActions}>
          <Tooltip content="Filtrar movimientos">
            <Button
              className={styles.iconButton}
              variant="outline"
              theme="optional"
              size="medium"
              icon={<Filter size={16} />}
              aria-label="Filtrar movimientos"
            />
          </Tooltip>
          {account.kind === 'bank' && (
            <Button size="medium" icon={<PlugZap size={16} />}>
              Conectar
            </Button>
          )}
          <Menus defaultPlacement="bottom-end">
            <Menus.Menu>
              <Menus.Toggle id="treasury-account-detail-actions" aria-label="Más acciones" verticalIcon />
              <Menus.List id="treasury-account-detail-actions" placement="bottom-end">
                <Menus.Item id="archive-account" disabled={isArchivingAccount} onClick={archiveCurrent}>
                  Archivar
                </Menus.Item>
                <Menus.Item id="delete-account" danger disabled={isDeletingAccount} onClick={deleteCurrent}>
                  Eliminar
                </Menus.Item>
              </Menus.List>
            </Menus.Menu>
          </Menus>
        </div>
      </header>

      <section className={styles.detailLayout}>
        <article className={styles.detailPanel}>
          <div className={styles.detailTop}>
            <div>
              <span className={styles.detailLabel}>Saldo</span>
              <div className={styles.balance}>{money(account.balance, account.currency)}</div>
              <span className={styles.muted}>
                <span className={`${styles.statusDot} ${account.connectionStatus === 'connected' ? styles.connected : ''}`} />
                {account.connectionStatus === 'connected' ? 'Cuenta conectada' : 'Cuenta no conectada'}
              </span>
            </div>
            <div className={styles.detailActions}>
              {account.accountingAccountCode && (
                <Tooltip content="Cuenta contable">
                  <span className={styles.accountingCode}>
                    Cuenta contable: <strong>{account.accountingAccountCode}</strong>
                    <Copy size={15} aria-hidden="true" />
                  </span>
                </Tooltip>
              )}
              <TextInput
                className={styles.searchField}
                label="Buscar movimiento"
                labelHidden
                icon={<Search size={16} />}
                placeholder="Buscar"
              />
              <Button size="medium" icon={<Plus size={16} />} onClick={() => setShowMovementModal(true)}>
                Movimiento
              </Button>
            </div>
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Tipo de extracto">
            <Button variant="outline" theme="optional" size="medium" data-active="true" role="tab" aria-selected="true">
              Extracto de movimientos
            </Button>
            <Button variant="outline" theme="optional" size="medium" role="tab" aria-selected="false">
              Extracto contable
            </Button>
          </div>

          {movements.length === 0 ? (
            <div className={styles.emptyState}>
              <div>
                <span className={styles.chartIcon}>
                  <CloudUpload size={24} />
                </span>
                <h2>Controla los movimientos de un vistazo</h2>
                <p className={styles.muted}>Importa tus movimientos o registra movimientos manuales.</p>
                <Button
                  variant="outline"
                  theme="optional"
                  size="medium"
                  icon={<CloudUpload size={16} />}
                  onClick={() => setShowMovementModal(true)}
                >
                  Registrar movimiento
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.movementList}>
              {movements.map((movement) => {
                const isInflow = movement.direction === 'inflow';
                const isReconciled = movement.reconciliationStatus === 'reconciled';

                return (
                  <div className={styles.movementRow} key={String(movement.id)}>
                    <span className={styles.movementMain}>
                      <strong>{movement.description}</strong>
                      <span className={styles.muted}>
                        {formatDate(movement.date)} · {movement.reference || 'Sin referencia'}
                      </span>
                    </span>
                    <span className={isInflow ? styles.moneyPositive : styles.moneyNegative}>
                      {isInflow ? '+' : '-'}
                      {money(movement.amount, movement.currency)}
                    </span>
                    {isReconciled ? (
                      <strong className={`${styles.statusBadge} ${styles.statusSuccess}`}>Conciliado</strong>
                    ) : account.kind === 'bank' ? (
                      <Button
                        variant="outline"
                        theme="optional"
                        size="slim"
                        loading={isReconcilingMovement}
                        onClick={() => reconcileMovement({ accountId, movementId: String(movement.id) })}
                      >
                        Conciliar
                      </Button>
                    ) : (
                      <strong className={styles.statusBadge}>Pendiente</strong>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <aside className={styles.summaryStack}>
          <section className={styles.summaryPanel}>
            <h2>Conciliación</h2>
            <p className={styles.muted}>Últimos 12 meses</p>
            <div className={styles.currencyBreakdown}>
              <div className={styles.breakdownRow}>
                <span>Movimientos pend.</span>
                <strong>{pendingMovements.length}</strong>
              </div>
              <div className={styles.breakdownRow}>
                <span>Cantidad pend.</span>
                <strong>
                  {money(
                    pendingMovements.reduce((sum, movement) => sum + Number(movement.amount ?? 0), 0),
                    account.currency,
                  )}
                </strong>
              </div>
            </div>
          </section>
          <section className={styles.summaryPanel}>
            <h2>Flujo de tesorería</h2>
            <p className={styles.muted}>Últimos 12 meses</p>
            <div className={styles.currencyBreakdown}>
              <div className={styles.breakdownRow}>
                <span className={styles.moneyPositive}>Entradas</span>
                <strong>{money(inflow, account.currency)}</strong>
              </div>
              <div className={styles.breakdownRow}>
                <span className={styles.moneyNegative}>Salidas</span>
                <strong>{money(outflow, account.currency)}</strong>
              </div>
              <div className={styles.breakdownRow}>
                <span>Saldo</span>
                <strong>{money(account.balance, account.currency)}</strong>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <MovementModal
        accountId={accountId}
        accountKind={account.kind}
        isOpen={showMovementModal}
        onClose={() => setShowMovementModal(false)}
      />
    </main>
  );
};

export default AccountDetails;
