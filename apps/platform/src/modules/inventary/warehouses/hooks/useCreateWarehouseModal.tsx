import { useModal } from '@hlb/design-system';
import { CreateWarehouseModal } from '../components';

export const useCreateWarehouseModal = () => {
  const { closeModal, openModal, requestCloseModal } = useModal();

  const openCreateWarehouseModal = (options?: { onSuccess?: () => void }) => {
    openModal(
      <CreateWarehouseModal
        closeModal={closeModal}
        requestCloseModal={requestCloseModal}
        onSuccess={options?.onSuccess}
      />,
      { id: 'create-warehouse' },
    );
  };

  return { openCreateWarehouseModal };
};
