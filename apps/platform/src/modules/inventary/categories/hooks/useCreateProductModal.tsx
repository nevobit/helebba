import { useModal } from '@hlb/design-system';
import { CreateCategoryModal } from '../components';
import type { CategoryRow } from '../types';

export const useCreateCategoryModal = () => {
  const { closeModal, openModal, requestCloseModal } = useModal();

  const openCreateCategoryModal = (options?: { onSuccess?: () => void }) => {
    openModal(
      <CreateCategoryModal
        closeModal={closeModal}
        requestCloseModal={requestCloseModal}
        onSuccess={options?.onSuccess}
      />,
      { id: 'create-category' },
    );
  };

  const openEditCategoryModal = (category: CategoryRow, options?: { onSuccess?: () => void }) => {
    openModal(
      <CreateCategoryModal
        initialCategory={category}
        closeModal={closeModal}
        requestCloseModal={requestCloseModal}
        onSuccess={options?.onSuccess}
      />,
      { id: `edit-category-${category.id}` },
    );
  };

  return { openCreateCategoryModal, openEditCategoryModal };
};
