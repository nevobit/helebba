import styles from './BrandsList.module.css';
import { BrandsTable, Header, Pagination, Toolbar } from '../../components';
import { useBrandsListController, useCreateBrandModal } from '../../hooks';

const BrandsList = () => {
  const controller = useBrandsListController();
  const { openCreateBrandModal } = useCreateBrandModal();
  const refreshBrands = () => controller.refetch();
  const openBrandModal = () => openCreateBrandModal({ onSuccess: refreshBrands });

  return (
    <main className={styles.page}>
      <title>Marcas - Helebba</title>

      <Header onBrandCreated={refreshBrands} />

      <section className={styles.panel} aria-label="Listado de marcas">
        <Toolbar query={controller.query} onQueryChange={controller.changeQuery} />

        <BrandsTable
          rows={controller.rows}
          error={controller.error}
          isLoading={controller.isLoading}
          hasBrands={controller.hasBrands}
          refetch={controller.refetch}
          onCreateBrand={openBrandModal}
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

export default BrandsList;
