import { useMemo, useState } from 'react';
import { Button } from '@hlb/design-system';
import { formatCurrency } from '@hlb/foundation';
import type { Document, Payment, PaymentMethod } from '@hlb/contracts';
import { Landmark, Mail, MoreVertical, Plus, UsersRound } from 'lucide-react';
import { useSession } from '@/shared';
import { usePayments } from '@/modules/accounting/payments/hooks';
import { useContacts } from '@/modules/contacts/hooks';
import { useDocuments } from '@/modules/sales/documents/hooks';
import { usePaymentMethods } from '@/modules/settings/payment-methods/hooks';
import { useTreasuryAccounts } from '@/modules/treasury/accounts/hooks';
import Banner from '../../sections/Banner';
// import { Start } from '../../sections/Start';
import styles from './Summary.module.css';
import Plan from '../../sections/Plan';

const MONTH_LABELS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];
const DASHBOARD_LIMIT = 100;

const numberValue = (value: unknown) => {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
};

const isSameYear = (value: string | undefined, year: number) => {
  if (!value) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getFullYear() === year;
};

const isSameMonth = (value: string | undefined, year: number, month: number) => {
  if (!value) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === month;
};

const paymentDirection = (payment: Payment) =>
  payment.direction ??
  (payment.documentType === 'purchase' || payment.documentType === 'expenses'
    ? 'outflow'
    : 'inflow');

const paymentGrossAmount = (payment: Payment) =>
  numberValue(payment.grossAmount ?? payment.amount ?? payment.netAmount);

const getPaymentMethod = (payment: Payment, paymentMethods: Map<string, PaymentMethod>) => {
  const paymentMethodId = payment.paymentMethodId ? String(payment.paymentMethodId) : '';
  const bankAccountId = payment.bankAccountId ? String(payment.bankAccountId) : '';

  return paymentMethods.get(paymentMethodId) ?? paymentMethods.get(bankAccountId);
};

const calculateFeeAmount = (
  grossAmount: number,
  direction: Payment['direction'],
  feeType?: Payment['feeType'] | PaymentMethod['financialFeeType'],
  feeValue?: number,
) => {
  const value = Math.max(numberValue(feeValue), 0);
  const limitForInflow = (amount: number) =>
    direction === 'inflow' ? Math.min(amount, grossAmount) : amount;

  if (feeType === 'fixed' || feeType === 'custom') return limitForInflow(value);
  if (feeType === 'percentage') return limitForInflow(grossAmount * (value / 100));

  return 0;
};

const paymentFeeAmount = (payment: Payment, paymentMethods: Map<string, PaymentMethod>) => {
  const persistedFee = numberValue(payment.feeAmount);
  if (persistedFee > 0) return persistedFee;

  const paymentMethod = getPaymentMethod(payment, paymentMethods);
  const feeType = payment.feeType ?? paymentMethod?.financialFeeType ?? 'none';
  const feeValue = payment.feeValue ?? paymentMethod?.financialFeeValue ?? 0;

  return calculateFeeAmount(
    paymentGrossAmount(payment),
    paymentDirection(payment),
    feeType,
    feeValue,
  );
};

const documentFeeAmount = (payment: Payment, documentsById: Map<string, Document>) => {
  if (!payment.documentId) return undefined;

  const document = documentsById.get(String(payment.documentId));
  if (!document || document.financialFeeValue === undefined) return undefined;

  return Math.max(numberValue(document.financialFeeValue), 0);
};

const pendingAmount = (document: Document) =>
  Math.max(numberValue(document.paymentsPending ?? document.total), 0);

const pendingFeeAmount = (document: Document) => {
  const fee = Math.max(numberValue(document.financialFeeValue), 0);
  const total = Math.max(numberValue(document.total), 0);
  const pending = pendingAmount(document);

  if (fee <= 0 || total <= 0 || pending <= 0) return 0;

  return Math.min(fee, fee * (pending / total));
};

const sumPending = (documents: readonly Document[], predicate: (document: Document) => boolean) =>
  documents.reduce(
    (total, document) => (predicate(document) ? total + pendingAmount(document) : total),
    0,
  );

const buildMonthlyPaymentSeries = (
  payments: readonly Payment[],
  now: Date,
  direction: 'inflow' | 'outflow',
) => {
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    const total = payments.reduce((sum, payment) => {
      if (paymentDirection(payment) !== direction) return sum;
      if (!isSameMonth(payment.date, date.getFullYear(), date.getMonth())) return sum;

      return sum + paymentGrossAmount(payment);
    }, 0);

    return {
      label: MONTH_LABELS[date.getMonth()],
      total,
    };
  });
  const max = Math.max(...months.map((month) => month.total), 1);

  return months.map((month) => ({
    ...month,
    height: Math.max(2, Math.round((month.total / max) * 72)),
  }));
};

const monthYearLabel = (date: Date) =>
  new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(date);

const methodLabel = (
  paymentMethodId: string | undefined,
  paymentMethodNames: Map<string, string>,
) => {
  if (!paymentMethodId) return 'Sin método';

  return paymentMethodNames.get(String(paymentMethodId)) ?? 'Método configurado';
};

const Summary = () => {
  const [activeView, setActiveView] = useState<'summary' | 'boards'>('summary');
  const organization = useSession((state) => state.organization);
  const currency = organization?.currency ?? 'COP';
  const money = (value: number) => formatCurrency(value, { currency });
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = now.getMonth();

  const { documents: invoices, isLoading: isLoadingInvoices } = useDocuments('invoice', {
    page: 1,
    limit: DASHBOARD_LIMIT,
  });
  const { documents: purchases, isLoading: isLoadingPurchases } = useDocuments('purchase', {
    page: 1,
    limit: DASHBOARD_LIMIT,
  });
  const { payments, isLoading: isLoadingPayments } = usePayments({
    page: 1,
    limit: DASHBOARD_LIMIT,
  });
  const { total: contactsTotal, isLoading: isLoadingContacts } = useContacts({
    page: 1,
    limit: 1,
    scope: 'all',
  });
  const { accounts, isLoading: isLoadingAccounts } = useTreasuryAccounts({
    page: 1,
    limit: DASHBOARD_LIMIT,
    kind: 'all',
  });
  const { paymentMethods } = usePaymentMethods({
    page: 1,
    limit: DASHBOARD_LIMIT,
  });
  const paymentMethodNames = useMemo(
    () =>
      new Map(
        paymentMethods.map((paymentMethod) => [String(paymentMethod.id), paymentMethod.name]),
      ),
    [paymentMethods],
  );
  const paymentMethodsByLookup = useMemo(() => {
    const lookup = new Map<string, PaymentMethod>();

    paymentMethods.forEach((paymentMethod) => {
      lookup.set(String(paymentMethod.id), paymentMethod);
      if (paymentMethod.bankingAccountId)
        lookup.set(String(paymentMethod.bankingAccountId), paymentMethod);
    });

    return lookup;
  }, [paymentMethods]);
  const documentsById = useMemo(() => {
    const lookup = new Map<string, Document>();

    [...invoices, ...purchases].forEach((document) => {
      lookup.set(String(document.id), document);
    });

    return lookup;
  }, [invoices, purchases]);

  const dashboard = useMemo(() => {
    const currentYearPayments = payments.filter((payment) => isSameYear(payment.date, year));
    const currentYearCollections = currentYearPayments
      .filter((payment) => paymentDirection(payment) === 'inflow')
      .reduce((total, payment) => total + paymentGrossAmount(payment), 0);
    const currentYearOutflows = currentYearPayments
      .filter((payment) => paymentDirection(payment) === 'outflow')
      .reduce((total, payment) => total + paymentGrossAmount(payment), 0);
    const currentYearFees = currentYearPayments.reduce(
      (total, payment) =>
        total +
        (documentFeeAmount(payment, documentsById) ??
          paymentFeeAmount(payment, paymentMethodsByLookup)),
      0,
    );
    const currentYearInvoicedSales = invoices
      .filter((invoice) => isSameYear(invoice.date, year))
      .reduce((total, invoice) => total + numberValue(invoice.total), 0);
    const currentYearInvoiceCount = invoices.filter((invoice) =>
      isSameYear(invoice.date, year),
    ).length;
    const currentMonthReceivables = sumPending(invoices, (invoice) =>
      isSameMonth(invoice.dueDate ?? invoice.date, year, month),
    );
    const currentMonthPendingFees = invoices
      .filter((invoice) => isSameMonth(invoice.dueDate ?? invoice.date, year, month))
      .reduce((total, invoice) => total + pendingFeeAmount(invoice), 0);
    const currentMonthPayables = sumPending(purchases, (purchase) =>
      isSameMonth(purchase.dueDate ?? purchase.date, year, month),
    );
    const currentMonthPayments = payments.filter((payment) =>
      isSameMonth(payment.date, year, month),
    );
    const bankInflow = currentMonthPayments
      .filter((payment) => paymentDirection(payment) === 'inflow')
      .reduce((total, payment) => total + paymentGrossAmount(payment), 0);
    const bankOutflow = currentMonthPayments
      .filter((payment) => paymentDirection(payment) === 'outflow')
      .reduce((total, payment) => total + paymentGrossAmount(payment), 0);
    const currentMonthFees = currentMonthPayments.reduce(
      (total, payment) =>
        total +
        (documentFeeAmount(payment, documentsById) ??
          paymentFeeAmount(payment, paymentMethodsByLookup)),
      0,
    );
    const salesByPaymentMethod = invoices
      .filter((invoice) => isSameMonth(invoice.date, year, month))
      .reduce<Record<string, number>>((groups, invoice) => {
        const label = methodLabel(invoice.paymentMethodId, paymentMethodNames);
        groups[label] = (groups[label] ?? 0) + numberValue(invoice.total);
        return groups;
      }, {});

    return {
      currentYearSales: currentYearCollections,
      currentYearInvoicedSales,
      currentYearInvoiceCount,
      currentYearExpenses: currentYearOutflows,
      currentYearFees,
      benefit: currentYearCollections - currentYearOutflows - currentYearFees,
      currentMonthPayables,
      currentMonthReceivables,
      currentMonthPendingFees,
      bankInflow,
      bankOutflow,
      bankBalance: bankInflow - bankOutflow - currentMonthFees,
      currentMonthFees,
      salesSeries: buildMonthlyPaymentSeries(payments, now, 'inflow'),
      expensesSeries: buildMonthlyPaymentSeries(payments, now, 'outflow'),
      salesByPaymentMethod,
    };
  }, [
    documentsById,
    invoices,
    month,
    now,
    paymentMethodNames,
    paymentMethodsByLookup,
    payments,
    purchases,
    year,
  ]);

  const bankAccounts = accounts.filter((account) => account.kind === 'bank');
  const hasBankAccounts = bankAccounts.length > 0;
  const hasSalesByPaymentMethod = Object.keys(dashboard.salesByPaymentMethod).length > 0;

  return (
    <main
      className={`${styles.page} ${activeView === 'summary' ? styles.summaryPage : styles.boardsPage}`}
    >
      <div className={`${styles.shell} ${styles.tabShell}`}>
        <nav className={styles.tabs} aria-label="Secciones del home">
          <button
            type="button"
            className={activeView === 'summary' ? styles.activeTab : undefined}
            onClick={() => setActiveView('summary')}
          >
            Resumen
          </button>
          <button
            type="button"
            className={activeView === 'boards' ? styles.activeTab : undefined}
            onClick={() => setActiveView('boards')}
          >
            Tableros
          </button>
        </nav>
      </div>
      {activeView === 'summary' ? (
        <div className={styles.summaryContent}>
          <Banner />
          <Plan />
          {/* <Start /> */}
        </div>
      ) : (
        <div className={styles.shell}>
          <div className={styles.boardBar}>
            <button type="button" className={styles.boardPill}>
              Resumen
              <MoreVertical size={14} aria-hidden="true" />
            </button>
            <Button variant="plain" size="slim" icon={<Plus size={16} />}>
              Nuevo board
            </Button>
            <Button
              className={styles.addButton}
              variant="plain"
              size="slim"
              icon={<Plus size={16} />}
            >
              Añadir
            </Button>
          </div>

          <section className={styles.grid} aria-label="Tablero principal">
            <article className={`${styles.card} ${styles.metricCard}`}>
              <h2>Facturas</h2>
              <p>Año actual</p>
              <strong>
                {isLoadingInvoices ? money(0) : money(dashboard.currentYearInvoicedSales)}
              </strong>
              <div className={styles.progressMeta}>
                <span>Total emitido</span>
                <span>{isLoadingInvoices ? '0' : `${dashboard.currentYearInvoiceCount}`}</span>
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <span className={styles.invoiceTrack} />
              </div>
            </article>

            <article className={`${styles.card} ${styles.metricCard}`}>
              <h2>Ventas</h2>
              <p>Año actual</p>
              <strong>{isLoadingPayments ? money(0) : money(dashboard.currentYearSales)}</strong>
              <div className={styles.progressMeta}>
                <span>Ventas registradas</span>
                <span>{money(dashboard.currentYearInvoicedSales)}</span>
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <span />
              </div>
            </article>

            <article className={`${styles.card} ${styles.metricCard}`}>
              <h2>Gastos</h2>
              <p>Año actual</p>
              <strong>{isLoadingPayments ? money(0) : money(dashboard.currentYearExpenses)}</strong>
              <div className={styles.progressMeta}>
                <span>Pagos registrados</span>
                <span className={styles.negative}>{money(0)}</span>
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <span className={styles.expenseTrack} />
              </div>
            </article>

            <article className={`${styles.card} ${styles.metricCard}`}>
              <h2>Ganancia</h2>
              <p>Año actual</p>
              <strong>{isLoadingPayments ? money(0) : money(dashboard.benefit)}</strong>
              <div className={styles.progressMeta}>
                <span>Comisiones descontadas</span>
                <span className={styles.negative}>
                  {isLoadingPayments ? money(0) : money(dashboard.currentYearFees)}
                </span>
              </div>
            </article>

            <article className={`${styles.card} ${styles.bankCard}`}>
              <div className={styles.bankIllustration} aria-hidden="true">
                <Landmark size={34} />
                <span />
              </div>
              <strong>{hasBankAccounts ? 'Banco conectado' : 'Crea tu primer banco'}</strong>
              <p>
                {hasBankAccounts
                  ? `${bankAccounts.length} cuentas listas para controlar tus movimientos.`
                  : isLoadingAccounts
                    ? 'Estamos cargando tus cuentas bancarias.'
                    : 'Conecta tus bancos para relacionar y tener un control máximo de tus movimientos.'}
              </p>
            </article>

            <article className={`${styles.card} ${styles.wideCard}`}>
              <DashboardChart
                title="Resumen ventas"
                subtitle="Últimos 12 meses"
                value={isLoadingPayments ? money(0) : money(dashboard.currentYearSales)}
                referenceLabel="Objetivo"
                referenceValue={money(0)}
                series={dashboard.salesSeries}
              />
            </article>

            <article className={`${styles.card} ${styles.compactMetric}`}>
              <div className={styles.statusTitle}>
                <span className={styles.greenDot} />
                <h2>Pagos pendientes</h2>
              </div>
              <p>Mes actual</p>
              <strong>
                {isLoadingPurchases ? money(0) : money(dashboard.currentMonthPayables)}
              </strong>
            </article>

            <article className={`${styles.card} ${styles.bankFlowCard}`}>
              <h2>Entradas y salidas de banco</h2>
              <p>Mes actual</p>
              <dl>
                <FlowRow
                  color="green"
                  label="Entradas"
                  value={isLoadingPayments ? money(0) : money(dashboard.bankInflow)}
                />
                <FlowRow
                  color="red"
                  label="Salidas"
                  value={isLoadingPayments ? money(0) : money(dashboard.bankOutflow)}
                />
                <FlowRow
                  color="red"
                  label="Comisiones"
                  value={isLoadingPayments ? money(0) : money(dashboard.currentMonthFees)}
                />
                <FlowRow
                  color="blue"
                  label="Saldo"
                  value={isLoadingPayments ? money(0) : money(dashboard.bankBalance)}
                />
              </dl>
            </article>

            <article className={`${styles.card} ${styles.compactMetric}`}>
              <div className={styles.statusTitle}>
                <span className={styles.redDot} />
                <h2>Cobros pendientes</h2>
              </div>
              <p>Mes actual</p>
              <strong>
                {isLoadingInvoices ? money(0) : money(dashboard.currentMonthReceivables)}
              </strong>
            </article>

            <article className={`${styles.card} ${styles.compactMetric}`}>
              <div className={styles.statusTitle}>
                <span className={styles.amberDot} />
                <h2>Comisiones pendientes</h2>
              </div>
              <p>Mes actual</p>
              <strong>
                {isLoadingInvoices ? money(0) : money(dashboard.currentMonthPendingFees)}
              </strong>
            </article>

            <article className={`${styles.card} ${styles.wideCard}`}>
              <DashboardChart
                title="Resumen gastos"
                subtitle="Últimos 12 meses"
                value={isLoadingPayments ? money(0) : money(dashboard.currentYearExpenses)}
                referenceLabel="Presupuesto"
                referenceValue={money(0)}
                series={dashboard.expensesSeries}
              />
            </article>

            <article className={`${styles.card} ${styles.centerCard}`}>
              <Mail size={32} strokeWidth={1.6} aria-hidden="true" />
              <strong>0 Emails no leídos</strong>
              <p>Envía facturas y presupuestos por email y podrás saber si han sido leídos.</p>
            </article>

            <article className={`${styles.card} ${styles.centerCard}`}>
              <UsersRound size={22} strokeWidth={1.6} aria-hidden="true" />
              <strong>{isLoadingContacts ? '0 Contactos' : `${contactsTotal} Contactos`}</strong>
            </article>

            <article className={`${styles.card} ${styles.paymentCard}`}>
              <h2>Ventas por método de pago</h2>
              <p>Mes actual</p>
              {hasSalesByPaymentMethod ? (
                <ul>
                  {Object.entries(dashboard.salesByPaymentMethod).map(([method, value]) => (
                    <li key={method}>
                      <span>{method}</span>
                      <strong>{money(value)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <strong>No hay datos</strong>
              )}
            </article>

            <article className={`${styles.card} ${styles.tasksCard}`}>
              <h2>Mis tareas</h2>
              <p>Todos los proyectos</p>
              <div className={styles.taskEmpty}>
                <span aria-hidden="true" />
                <strong>No tienes tareas asignadas</strong>
              </div>
            </article>
          </section>
        </div>
      )}
    </main>
  );
};

type DashboardChartProps = {
  title: string;
  subtitle: string;
  value: string;
  referenceLabel: string;
  referenceValue: string;
  series: Array<{ label: string; height: number }>;
};

const DashboardChart = ({
  title,
  subtitle,
  value,
  referenceLabel,
  referenceValue,
  series,
}: DashboardChartProps) => (
  <>
    <div className={styles.chartHeader}>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
    <div className={styles.chartBody}>
      <div className={styles.chartValue}>
        <strong>{value}</strong>
        <span>{monthYearLabel(new Date())}</span>
      </div>
      <dl className={styles.chartStats}>
        <div>
          <dt>{referenceLabel}</dt>
          <dd>{referenceValue}</dd>
        </div>
        <div>
          <dt>MoM</dt>
          <dd>-</dd>
        </div>
      </dl>
    </div>
    <div className={styles.bars} aria-hidden="true">
      {series.map((point, index) => (
        <span key={`${point.label}-${index}`} style={{ height: point.height }} />
      ))}
    </div>
    <div className={styles.months} aria-hidden="true">
      {series.map((point, index) => (
        <span key={`${point.label}-label-${index}`}>{point.label}</span>
      ))}
    </div>
  </>
);

type FlowRowProps = {
  color: 'green' | 'red' | 'blue';
  label: string;
  value: string;
};

const FlowRow = ({ color, label, value }: FlowRowProps) => (
  <div className={styles.flowRow}>
    <dt>
      <span className={styles[color]} />
      {label}
    </dt>
    <dd>{value}</dd>
  </div>
);

export default Summary;
