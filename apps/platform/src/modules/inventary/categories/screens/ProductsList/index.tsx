import styles from './ProductsList.module.css';
import { CategoriesTable, Header, Pagination, Toolbar } from '../../components';
import { useCategoriesListController, useCreateCategoryModal } from '../../hooks';
import { useDeleteCategory } from '../../hooks';
import { useModal } from '@hlb/design-system';
import type { CategoryRow } from '../../types';

const CategoriesList = () => {
  const controller = useCategoriesListController();
  const { openCreateCategoryModal, openEditCategoryModal } = useCreateCategoryModal();
  const { requestCloseModal } = useModal();
  const { deleteCategory, deleteCategoryError, isDeletingCategory } = useDeleteCategory();
  const refreshCategories = () => controller.refetch();
  const openCategoryModal = () => openCreateCategoryModal({ onSuccess: refreshCategories });
  const confirmDelete = (category: CategoryRow) => {
    if (isDeletingCategory) return;
    requestCloseModal({
      confirm: true,
      title: 'Eliminar categoría',
      description: `La categoría “${category.name}” dejará de estar disponible. ¿Deseas continuar?`,
      confirmLabel: 'Eliminar categoría',
      cancelLabel: 'Cancelar',
      onConfirm: () => deleteCategory(category.id),
    });
  };

  return (
    <main className={styles.page}>
      <title>Categorías - Helebba</title>

      <Header onCategoryCreated={refreshCategories} />

      <section className={styles.panel} aria-label="Listado de categorías">
        <Toolbar query={controller.query} onQueryChange={controller.changeQuery} />

        {deleteCategoryError && (
          <div className={styles.feedback} role="alert">
            <strong>
              {deleteCategoryError instanceof Error
                ? deleteCategoryError.message
                : 'No pudimos eliminar la categoría.'}
            </strong>
          </div>
        )}

        <CategoriesTable
          rows={controller.rows}
          error={controller.error}
          isLoading={controller.isLoading}
          hasCategories={controller.hasCategories}
          refetch={controller.refetch}
          onCreateCategory={openCategoryModal}
          onDeleteCategory={confirmDelete}
          onEditCategory={(category) => openEditCategoryModal(category, { onSuccess: refreshCategories })}
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
