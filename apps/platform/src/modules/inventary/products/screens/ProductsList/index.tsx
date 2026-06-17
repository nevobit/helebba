import styles from './ProductsList.module.css';
import { Header, Pagination, ProductsTable, Toolbar } from '../../components';
import { useCreateProductModal, useProductsListController } from '../../hooks';

const ProductsList = () => {
  const controller = useProductsListController();
  const { openCreateProductModal } = useCreateProductModal();
  const refreshProducts = () => controller.refetch();
  const openProductModal = () => openCreateProductModal({ onSuccess: refreshProducts });

  return (
    <main className={styles.page}>
      <title>Productos - Helebba</title>

      <Header onProductCreated={refreshProducts} />

      <section className={styles.panel} aria-label="Listado de productos">
        <Toolbar query={controller.query} onQueryChange={controller.changeQuery} />

        <ProductsTable
          rows={controller.rows}
          error={controller.error}
          isLoading={controller.isLoading}
          hasProducts={controller.hasProducts}
          refetch={controller.refetch}
          onCreateProduct={openProductModal}
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

export default ProductsList;
