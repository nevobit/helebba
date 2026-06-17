import { useModal } from '@hlb/design-system';
import { CreateProductModal } from '../components';

export const useCreateProductModal = () => {
  const { closeModal, openModal, requestCloseModal } = useModal();

  const openCreateProductModal = (options?: { onSuccess?: () => void }) => {
    openModal(
      <CreateProductModal
        closeModal={closeModal}
        requestCloseModal={requestCloseModal}
        onSuccess={options?.onSuccess}
      />,
      { id: 'create-product' },
    );
  };

  return { openCreateProductModal };
};
