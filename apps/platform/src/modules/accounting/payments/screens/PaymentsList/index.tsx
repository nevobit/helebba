import { useState } from 'react';
import {
  Header,
  Pagination,
  PaymentDetailsModal,
  PaymentFormModal,
  PaymentsTable,
  Toolbar,
} from '../../components';
import { usePaymentsListController } from '../../hooks';
import type { PaymentRow } from '../../types';
import styles from './PaymentsList.module.css';

const PaymentsList = () => {
  const controller = usePaymentsListController();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);

  return (
    <main className={styles.page}>
      <title>Pagos y Cobros - Helebba</title>

      <Header onCreatePayment={() => setIsCreateModalOpen(true)} />

      <section className={styles.panel} aria-label="Listado de pagos">
        <Toolbar
          query={controller.query}
          status={controller.status}
          onQueryChange={controller.changeQuery}
          onStatusChange={controller.changeStatus}
        />

        <PaymentsTable
          rows={controller.rows}
          error={controller.error}
          isLoading={controller.isLoading}
          hasPayments={controller.hasPayments}
          refetch={controller.refetch}
          onCreatePayment={() => setIsCreateModalOpen(true)}
          onOpenPayment={setSelectedPayment}
        />

        {controller.showPagination && (
          <Pagination
            page={controller.page}
            pageSize={controller.pageSize}
            total={controller.total}
            startItem={controller.startItem}
            endItem={controller.endItem}
            onPageChange={controller.setPage}
            onPageSizeChange={controller.changePageSize}
          />
        )}
      </section>

      {isCreateModalOpen && <PaymentFormModal onClose={() => setIsCreateModalOpen(false)} />}
      {selectedPayment && (
        <PaymentDetailsModal row={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}
    </main>
  );
};

export default PaymentsList;
