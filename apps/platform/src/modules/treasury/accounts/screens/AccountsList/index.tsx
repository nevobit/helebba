import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CreditCard,
  Grid2X2Plus,
  Info,
  Landmark,
  List,
  Plus,
  Search,
  Wallet,
} from 'lucide-react';
import {
  Button,
  Menus,
  Modal,
  Table,
  TextInput,
  Tooltip,
  type DataTableColumn,
} from '@hlb/design-system';
import { formatCurrency } from '@hlb/foundation';
import type { BankingAccount, TreasuryAccountKind, TreasuryAccountProductType } from '@hlb/contracts';
import {
  useArchiveTreasuryAccount,
  useCreateTreasuryAccount,
  useDeleteTreasuryAccount,
  useTreasuryAccounts,
} from '../../hooks';
import styles from './AccountsList.module.css';

type AddStep = 'type' | 'bank' | 'form';

type AccountFormState = {
  kind: TreasuryAccountKind;
  productType: TreasuryAccountProductType;
  name: string;
  bankName: string;
  bankCode: string;
  iban: string;
  swift: string;
  currency: string;
  initialBalance: string;
  accountingAccountCode: string;
};

type AccountRow = {
  id: string;
  account: string;
  kind: string;
  info: string;
  balance: number;
  currency: string;
  pending: string;
  source: BankingAccount;
};

const banks = [
  { code: 'bancolombia', name: 'Bancolombia', mark: 'BC' },
  { code: 'bogota', name: 'Banco De Bogotá', mark: 'BG' },
  { code: 'davivienda', name: 'Davivienda', mark: 'DV' },
  { code: 'bbva', name: 'Bbva Colombia', mark: 'BB' },
  { code: 'occidente', name: 'Banco De Occidente', mark: 'BO' },
];

const initialForm: AccountFormState = {
  kind: 'bank',
  productType: 'checking',
  name: '',
  bankName: '',
  bankCode: '',
  iban: '',
  swift: '',
  currency: 'COP',
  initialBalance: '0',
  accountingAccountCode: '',
};

const getAccountId = (account: BankingAccount) => String(account.id);

const getAccountMark = (account: BankingAccount) =>
  account.kind === 'cash' ? 'CJ' : (account.bankName || account.name || 'BA').slice(0, 2).toUpperCase();

const AddAccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState<AddStep>('type');
  const [formState, setFormState] = useState<AccountFormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const { createAccount, isCreatingAccount } = useCreateTreasuryAccount();

  const updateField = (name: keyof AccountFormState, value: string) => {
    setFormState((current) => ({ ...current, [name]: value }));
    setError(null);
  };

  const chooseKind = (kind: TreasuryAccountKind, productType: TreasuryAccountProductType) => {
    setFormState({
      ...initialForm,
      kind,
      productType,
      name: kind === 'cash' ? 'Caja principal' : '',
    });
    setStep(kind === 'cash' ? 'form' : 'bank');
  };

  const chooseBank = (bank: (typeof banks)[number]) => {
    setFormState((current) => ({
      ...current,
      bankCode: bank.code,
      bankName: bank.name,
      name: bank.name,
    }));
    setStep('form');
  };

  const close = () => {
    setStep('type');
    setFormState(initialForm);
    setError(null);
    onClose();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim()) {
      setError('Ingresa el nombre de la cuenta.');
      return;
    }

    createAccount(
      {
        kind: formState.kind,
        productType: formState.productType,
        name: formState.name.trim(),
        bankName: formState.kind === 'bank' ? formState.bankName : undefined,
        bankCode: formState.kind === 'bank' ? formState.bankCode : undefined,
        iban: formState.iban.trim() || undefined,
        swift: formState.swift.trim() || undefined,
        currency: formState.currency,
        initialBalance: Number(formState.initialBalance || 0),
        balance: Number(formState.initialBalance || 0),
        accountingAccountCode: formState.accountingAccountCode.trim() || undefined,
        connectionStatus: 'not_connected',
      },
      {
        onSuccess: close,
        onError: (err) => setError(err instanceof Error ? err.message : 'No pudimos crear la cuenta.'),
      },
    );
  };

  const title =
    step === 'type'
      ? 'Indica qué tipo de cuenta quieres añadir'
      : step === 'bank'
        ? 'Indica a qué banco pertenece la cuenta'
        : formState.kind === 'cash'
          ? 'Añadir cuenta de caja'
          : 'Vincula tu banco a Helebba';

  return (
    <Modal.Window
      isOpen={isOpen}
      ariaLabel={title}
      className={styles.modal}
      closeStrategy="manual"
      closeOnOverlay
      closeOnEsc
      onClose={onClose}
      onRequestClose={close}
      size={{ width: '86rem', maxWidth: 'calc(100vw - 4rem)' }}
    >
      <Modal.Header className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>
          {step !== 'type' && (
            <Button
              className={styles.iconButton}
              variant="outline"
              theme="optional"
              size="medium"
              icon={<span aria-hidden="true">←</span>}
              aria-label="Volver"
              onClick={() => setStep(step === 'form' && formState.kind === 'bank' ? 'bank' : 'type')}
            />
          )}
          {title}
        </h2>
        <Modal.CloseButton onClick={close} label="Cerrar" />
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        {step === 'type' && (
          <div className={styles.typeGrid}>
            <button className={styles.typeCard} type="button" onClick={() => chooseKind('bank', 'checking')}>
              <span>
                <Landmark size={22} />
                <h3>Banco</h3>
                <p>Cuentas corrientes, depósitos, préstamos y líneas de crédito.</p>
              </span>
              <Building2 size={44} />
            </button>
            <button className={styles.typeCard} type="button" onClick={() => chooseKind('bank', 'card')}>
              <span>
                <CreditCard size={22} />
                <h3>Tarjeta</h3>
                <p>Tarjetas de crédito y débito.</p>
              </span>
              <CreditCard size={44} />
            </button>
            <button className={styles.typeCard} type="button" onClick={() => chooseKind('bank', 'payment_gateway')}>
              <span>
                <Wallet size={22} />
                <h3>Pasarela de pago</h3>
                <p>PayPal, Stripe y otros saldos conectados.</p>
              </span>
              <Wallet size={44} />
            </button>
            <button className={styles.typeCard} type="button" onClick={() => chooseKind('cash', 'cash')}>
              <span>
                <Wallet size={22} />
                <h3>Caja</h3>
                <p>Movimientos en efectivo.</p>
              </span>
              <BarChart3 size={44} />
            </button>
          </div>
        )}

        {step === 'bank' && (
          <div className={styles.bankList}>
            {banks.map((bank) => (
              <button className={styles.bankOption} type="button" key={bank.code} onClick={() => chooseBank(bank)}>
                <span className={styles.accountCell}>
                  <span className={styles.logoMark}>{bank.mark}</span>
                  <strong>{bank.name}</strong>
                </span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        )}

        {step === 'form' && (
          <form id="treasury-account-form" onSubmit={submit}>
            <div className={styles.formGrid}>
              <TextInput
                label="Nombre de la cuenta"
                required
                value={formState.name}
                error={error ?? undefined}
                onChange={(event) => updateField('name', event.target.value)}
              />
              <label className={styles.selectField}>
                <span>Moneda</span>
                <select value={formState.currency} onChange={(event) => updateField('currency', event.target.value)}>
                  <option value="COP">Peso colombiano (COP)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dólar estadounidense (USD)</option>
                </select>
              </label>
              <TextInput
                label="IBAN"
                placeholder="Escribe el IBAN de la cuenta"
                value={formState.iban}
                onChange={(event) => updateField('iban', event.target.value)}
              />
              <TextInput
                label="BIC/SWIFT"
                placeholder="Escribe el BIC de la cuenta"
                value={formState.swift}
                onChange={(event) => updateField('swift', event.target.value)}
              />
              <TextInput
                label="Saldo inicial"
                type="number"
                value={formState.initialBalance}
                onChange={(event) => updateField('initialBalance', event.target.value)}
              />
              <TextInput
                label="Cuenta contable"
                value={formState.accountingAccountCode}
                onChange={(event) => updateField('accountingAccountCode', event.target.value)}
              />
            </div>
          </form>
        )}
      </Modal.Body>

      {step === 'form' && (
        <Modal.Footer className={styles.modalFooter}>
          <Button variant="outline" theme="optional" size="medium" onClick={close}>
            Cancelar
          </Button>
          <Button form="treasury-account-form" type="submit" size="medium" loading={isCreatingAccount}>
            Añadir cuenta
          </Button>
        </Modal.Footer>
      )}
    </Modal.Window>
  );
};

const AccountsList = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<TreasuryAccountKind | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const { accounts, error, isLoading, refetch, total } = useTreasuryAccounts({ kind, limit: 100, search: query });
  const { archiveAccount } = useArchiveTreasuryAccount();
  const { deleteAccount } = useDeleteTreasuryAccount();
  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.balance ?? 0), 0),
    [accounts],
  );
  const rows = useMemo<AccountRow[]>(
    () =>
      accounts.map((account) => ({
        id: getAccountId(account),
        account: account.name,
        kind: account.kind === 'cash' ? 'Caja' : 'Banco',
        info: account.iban || account.accountNumber || '-',
        balance: Number(account.balance ?? 0),
        currency: account.currency,
        pending: 'Sin movimientos',
        source: account,
      })),
    [accounts],
  );

  const columns = useMemo<DataTableColumn<AccountRow>[]>(
    () => [
      {
        key: 'account',
        header: 'Cuenta',
        width: 320,
        render: (_value, row) => (
          <span className={styles.accountCell}>
            <span className={styles.logoMark}>{getAccountMark(row.source)}</span>
            <span className={styles.accountName}>
              <strong>{row.account}</strong>
              <span className={styles.muted}>
                <span className={`${styles.statusDot} ${row.source.connectionStatus === 'connected' ? styles.connected : ''}`} />
                {row.source.connectionStatus === 'connected' ? 'Cuenta conectada' : 'Cuenta no conectada'}
              </span>
            </span>
          </span>
        ),
      },
      {
        key: 'kind',
        header: 'Información',
        width: 220,
        render: (_value, row) => (
          <span className={styles.accountName}>
            <strong>{row.kind}</strong>
            <span className={styles.muted}>{row.info}</span>
          </span>
        ),
      },
      {
        key: 'balance',
        header: 'Saldo',
        width: 160,
        align: 'right',
        render: (value, row) => <strong>{formatCurrency(Number(value ?? 0), { currency: row.currency })}</strong>,
      },
      { key: 'pending', header: 'Por conciliar', width: 180 },
      {
        key: 'id',
        header: '',
        width: 52,
        align: 'right',
        headerAriaLabel: 'Acciones',
        render: (_value, row) => (
          <Menus defaultPlacement="bottom-end">
            <Menus.Menu>
              <Menus.Toggle id={`account-actions-${row.id}`} aria-label={`Opciones de ${row.account}`} verticalIcon />
              <Menus.List id={`account-actions-${row.id}`} placement="bottom-end">
                <Menus.Item id={`open-${row.id}`} onClick={() => navigate(`/bank-accounts/${row.id}`)}>
                  Ver detalle
                </Menus.Item>
                <Menus.Item
                  id={`archive-${row.id}`}
                  onClick={() => {
                    if (window.confirm(`¿Archivar "${row.account}"?`)) archiveAccount(row.id);
                  }}
                >
                  Archivar
                </Menus.Item>
                <Menus.Item
                  id={`delete-${row.id}`}
                  danger
                  onClick={() => {
                    if (window.confirm(`¿Eliminar "${row.account}"?`)) deleteAccount(row.id);
                  }}
                >
                  Eliminar
                </Menus.Item>
              </Menus.List>
            </Menus.Menu>
          </Menus>
        ),
      },
    ],
    [archiveAccount, deleteAccount, navigate],
  );

  return (
    <main className={styles.page}>
      <title>Cuentas - Helebba</title>
      <header className={styles.header}>
        <Tooltip content="Gestiona bancos, cajas y movimientos de tesorería.">
          <h1 className={styles.titleGroup}>
            Cuentas
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
          <Button size="medium" icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Añadir cuenta <span className={styles.shortcut}>N</span>
          </Button>
        </div>
      </header>

      <section className={styles.overview}>
        <div className={styles.sideStack}>
          <aside className={styles.balancePanel}>
            <span className={styles.balanceLabel}>Saldo</span>
            <div className={styles.balanceValue}>{formatCurrency(totalBalance, { currency: 'COP' })}</div>
            <div className={styles.currencyBreakdown}>
              <span className={styles.breakdownTitle}>Detalle de saldos por moneda</span>
              <div className={styles.breakdownRow}>
                <span className={styles.muted}>COP</span>
                <strong>{formatCurrency(totalBalance, { currency: 'COP' })}</strong>
              </div>
            </div>
          </aside>
          <aside className={styles.rulesPanel}>
            <h2>Reglas de conciliación</h2>
            <p className={styles.muted}>Crea reglas y concilia movimientos de forma automática.</p>
            <Button variant="outline" theme="optional" size="medium">
              Nueva regla
            </Button>
          </aside>
        </div>
        <section className={styles.chartPanel}>
          <div className={styles.chartEmpty}>
            <span className={styles.chartIcon}>
              <BarChart3 size={24} />
            </span>
            <h2>Sigue tus movimientos</h2>
            <p className={styles.muted}>
              Sincroniza o importa nuevos movimientos para mantener tu flujo de caja actualizado.
            </p>
          </div>
        </section>
      </section>

      <section className={styles.panel} aria-label="Listado de cuentas">
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <label className={styles.selectLabel}>
              <span>Tipo de cuenta</span>
              <select value={kind} onChange={(event) => setKind(event.target.value as TreasuryAccountKind | 'all')}>
                <option value="all">Todas las cuentas</option>
                <option value="bank">Bancos</option>
                <option value="cash">Cajas</option>
              </select>
            </label>
          </div>
          <div className={styles.toolbarRight}>
            <TextInput
              className={styles.searchField}
              label="Buscar cuenta"
              labelHidden
              icon={<Search size={16} />}
              value={query}
              clearable
              onClear={() => setQuery('')}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {error ? (
          <div className={styles.feedback} role="alert">
            <strong>No pudimos cargar tus cuentas.</strong>
            <Button variant="outline" size="medium" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : rows.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <div>
              <h2>{total === 0 ? 'Aún no tienes cuentas' : 'No hay cuentas para mostrar'}</h2>
              <p className={styles.muted}>Añade bancos o cajas para gestionar tu tesorería.</p>
              <Button size="medium" icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
                Añadir cuenta
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <Table
              ariaLabel="Cuentas de tesorería"
              columns={columns}
              rows={rows}
              pageSize={rows.length}
              selectionMode="multi"
              defaultSort={{ key: 'account', dir: 'asc' }}
              getRowKey={(row) => row.id}
              isLoading={isLoading}
              loadingText="Cargando cuentas..."
              emptyText="No hay cuentas para mostrar"
              onRowClick={(row) => navigate(`/bank-accounts/${row.id}`)}
            />
            <div className={styles.columnMenu} aria-hidden="true">
              <List size={16} />
            </div>
          </div>
        )}
      </section>

      <AddAccountModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </main>
  );
};

export default AccountsList;
