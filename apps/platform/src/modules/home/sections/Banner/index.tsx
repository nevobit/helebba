import { useSession } from '@/shared';
import styles from './Banner.module.css';
import { formatCurrency } from '@hlb/foundation';
import { useMemo } from 'react';
import type { Document, Payment, PaymentDirection, PaymentMethod } from '@hlb/contracts';
import { useDocuments } from '@/modules/sales/documents/hooks';
import { usePayments } from '@/modules/accounting/payments/hooks';
import { usePaymentMethods } from '@/modules/settings/payment-methods/hooks';

const DAYS_IN_PERIOD = 30;

const getFirstName = (name?: string | null) => {
  if (!name) return 'Nestor';
  return name.trim().split(' ')[0] || name;
};

const isInLastDays = (value: string | undefined, days: number) => {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const from = new Date();
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);

  return date >= from;
};

const getPaymentDirection = (payment: { direction?: PaymentDirection; documentType?: string }) =>
  payment.direction ??
  (payment.documentType === 'purchase' || payment.documentType === 'expenses'
    ? 'outflow'
    : 'inflow');

const paymentGrossAmount = (payment: {
  amount?: number;
  grossAmount?: number;
  netAmount?: number;
}) => Number(payment.grossAmount ?? payment.amount ?? payment.netAmount ?? 0);

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
  const value = Math.max(Number(feeValue ?? 0), 0);
  const limitForInflow = (amount: number) =>
    direction === 'inflow' ? Math.min(amount, grossAmount) : amount;

  if (feeType === 'fixed' || feeType === 'custom') return limitForInflow(value);
  if (feeType === 'percentage') return limitForInflow(grossAmount * (value / 100));

  return 0;
};

const paymentFeeAmount = (payment: Payment, paymentMethods: Map<string, PaymentMethod>) => {
  const persistedFee = Number(payment.feeAmount ?? 0);
  if (persistedFee > 0) return persistedFee;

  const paymentMethod = getPaymentMethod(payment, paymentMethods);
  const feeType = payment.feeType ?? paymentMethod?.financialFeeType ?? 'none';
  const feeValue = payment.feeValue ?? paymentMethod?.financialFeeValue ?? 0;

  return calculateFeeAmount(
    paymentGrossAmount(payment),
    getPaymentDirection(payment),
    feeType,
    feeValue,
  );
};

const documentFeeAmount = (payment: Payment, documentsById: Map<string, Document>) => {
  if (!payment.documentId) return undefined;

  const document = documentsById.get(String(payment.documentId));
  if (!document || document.financialFeeValue === undefined) return undefined;

  return Math.max(Number(document.financialFeeValue ?? 0), 0);
};

const Banner = () => {
  const user = useSession((state) => state.user);
  const organization = useSession((state) => state.organization);
  const currency = organization?.currency ?? 'COP';
  const { documents: invoices, isLoading } = useDocuments('invoice', { page: 1, limit: 100 });
  const { documents: purchases } = useDocuments('purchase', { page: 1, limit: 100 });
  const { payments, isLoading: isLoadingPayments } = usePayments({ page: 1, limit: 100 });
  const { paymentMethods } = usePaymentMethods({ page: 1, limit: 100 });
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

  const finances = useMemo(() => {
    const periodInvoices = invoices.filter((invoice) => isInLastDays(invoice.date, DAYS_IN_PERIOD));
    const periodPayments = payments.filter((payment) => isInLastDays(payment.date, DAYS_IN_PERIOD));
    const collections = periodPayments.filter(
      (payment) => getPaymentDirection(payment) === 'inflow',
    );
    const cash = periodPayments
      .filter((payment) => getPaymentDirection(payment) === 'inflow')
      .reduce(
        (total, payment) =>
          total +
          paymentGrossAmount(payment) -
          (documentFeeAmount(payment, documentsById) ??
            paymentFeeAmount(payment, paymentMethodsByLookup)),
        0,
      );
    const expenses = periodPayments
      .filter((payment) => getPaymentDirection(payment) === 'outflow')
      .reduce((total, payment) => total + paymentGrossAmount(payment), 0);
    const sales = collections.reduce((total, payment) => total + paymentGrossAmount(payment), 0);
    const receivable = periodInvoices.reduce((total, invoice) => {
      const invoiceTotal = Number(invoice.total ?? 0);

      return total + Number(invoice.paymentsPending ?? invoiceTotal);
    }, 0);

    return { sales, cash, expenses, receivable };
  }, [documentsById, invoices, paymentMethodsByLookup, payments]);

  const money = (value: number) => formatCurrency(value, { currency });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.gretting}>
          <h2>Hola, {getFirstName(user?.name)}</h2>
          <p>Tu camino en Helebba no ha hecho más que empezar.</p>
          <p>
            A partir de ahora, cada acción que realices potenciará la gestión de tu negocio. ¿Listo
            para seguir adelante?
          </p>
        </div>
        <div className={styles.finantial}>
          <div className={styles.finantialHeader}>
            <h4>Finanzas</h4>
            <select aria-label="Periodo financiero" disabled>
              <option value="30">Últimos 30 días</option>
            </select>
          </div>
          <div className={styles.cards}>
            <div className={styles.info}>
              <span className={styles.label}>Ventas</span>
              <h3>{isLoadingPayments ? money(0) : money(finances.sales)}</h3>
              <span className={styles.tip}>Cobros brutos registrados en el periodo.</span>
            </div>
            <div className={styles.info}>
              <span className={styles.label}>Cobros registrados</span>
              <h3>{isLoadingPayments ? money(0) : money(finances.cash)}</h3>
              <span className={styles.tip}>Pagos registrados en el módulo de cobros.</span>
            </div>
            <div className={styles.info}>
              <span className={styles.label}>Pendiente estimado</span>
              <h3>{isLoading ? money(0) : money(finances.receivable)}</h3>
              <span className={styles.tip}>
                Saldo calculado desde facturas, hasta conectar pagos.
              </span>
            </div>
            <div className={styles.info}>
              <span className={styles.label}>Gastos</span>
              <h3>{isLoadingPayments ? money(0) : money(finances.expenses)}</h3>
              <span className={styles.tip}>Pagos registrados en el periodo.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
