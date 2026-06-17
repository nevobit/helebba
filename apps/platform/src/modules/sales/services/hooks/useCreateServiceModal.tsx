import { useModal } from '@hlb/design-system';
import { CreateServiceModal } from '../components';

export const useCreateServiceModal = () => {
  const { closeModal, openModal, requestCloseModal } = useModal();

  const openCreateServiceModal = (options?: { onSuccess?: () => void }) => {
    openModal(
      <CreateServiceModal
        closeModal={closeModal}
        requestCloseModal={requestCloseModal}
        onSuccess={options?.onSuccess}
      />,
      { id: 'create-service' },
    );
  };

  return { openCreateServiceModal };
};
