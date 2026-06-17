import { Header, WarehousesGrid } from '../../components';
import { useCreateWarehouseModal, useWarehousesListController } from '../../hooks';
import styles from './WarehousesList.module.css';

const WarehousesList = () => {
  const controller = useWarehousesListController();
  const { openCreateWarehouseModal } = useCreateWarehouseModal();
  const refreshWarehouses = () => controller.refetch();
  const openWarehouseModal = () => openCreateWarehouseModal({ onSuccess: refreshWarehouses });

  return (
    <main className={styles.page}>
      <title>Almacenes - Helebba</title>

      <Header onWarehouseCreated={refreshWarehouses} />

      <WarehousesGrid
        rows={controller.rows}
        error={controller.error}
        isLoading={controller.isLoading}
        hasWarehouses={controller.hasWarehouses}
        refetch={controller.refetch}
        onCreateWarehouse={openWarehouseModal}
      />
    </main>
  );
};

export default WarehousesList;
