import { useModal } from '@hlb/design-system';
import { CreateCategoryModal } from '../components';

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

  return { openCreateCategoryModal };
};
