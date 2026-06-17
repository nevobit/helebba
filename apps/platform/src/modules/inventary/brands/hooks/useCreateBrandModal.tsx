import { useModal } from '@hlb/design-system';
import { CreateBrandModal } from '../components';

export const useCreateBrandModal = () => {
  const { closeModal, openModal, requestCloseModal } = useModal();

  const openCreateBrandModal = (options?: { onSuccess?: () => void }) => {
    openModal(
      <CreateBrandModal
        closeModal={closeModal}
        requestCloseModal={requestCloseModal}
        onSuccess={options?.onSuccess}
      />,
      { id: 'create-brand' },
    );
  };

  return { openCreateBrandModal };
};
