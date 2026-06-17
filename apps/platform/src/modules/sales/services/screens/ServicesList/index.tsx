import { Header, Pagination, ServicesTable, Toolbar } from '../../components';
import { useCreateServiceModal, useServicesListController } from '../../hooks';
import styles from './ServicesList.module.css';

const ServicesList = () => {
  const controller = useServicesListController();
  const { openCreateServiceModal } = useCreateServiceModal();
  const refreshServices = () => controller.refetch();
  const openServiceModal = () => openCreateServiceModal({ onSuccess: refreshServices });

  return (
    <main className={styles.page}>
      <title>Servicios - Helebba</title>

      <Header onServiceCreated={refreshServices} />

      <section className={styles.panel} aria-label="Listado de servicios">
        <Toolbar query={controller.query} onQueryChange={controller.changeQuery} />

        <ServicesTable
          rows={controller.rows}
          error={controller.error}
          isLoading={controller.isLoading}
          hasServices={controller.hasServices}
          refetch={controller.refetch}
          onCreateService={openServiceModal}
        />

        {controller.showPagination && (
          <Pagination
            page={controller.page}
            pageInfo={controller.pageInfo}
            pageSize={controller.pageSize}
            total={controller.total}
            startItem={controller.startItem}
            endItem={controller.endItem}
            onPageChange={controller.setPage}
            onPageSizeChange={controller.changePageSize}
          />
        )}
      </section>
    </main>
  );
};

export default ServicesList;
