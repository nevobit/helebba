import styles from './ProductsList.module.css';
import { CategoriesTable, Header, Pagination, Toolbar } from '../../components';
import { useCategoriesListController, useCreateCategoryModal } from '../../hooks';

const CategoriesList = () => {
  const controller = useCategoriesListController();
  const { openCreateCategoryModal } = useCreateCategoryModal();
  const refreshCategories = () => controller.refetch();
  const openCategoryModal = () => openCreateCategoryModal({ onSuccess: refreshCategories });

  return (
    <main className={styles.page}>
      <title>Categorías - Helebba</title>

      <Header onCategoryCreated={refreshCategories} />

      <section className={styles.panel} aria-label="Listado de categorías">
        <Toolbar query={controller.query} onQueryChange={controller.changeQuery} />

        <CategoriesTable
          rows={controller.rows}
          error={controller.error}
          isLoading={controller.isLoading}
          hasCategories={controller.hasCategories}
          refetch={controller.refetch}
          onCreateCategory={openCategoryModal}
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

export default CategoriesList;
