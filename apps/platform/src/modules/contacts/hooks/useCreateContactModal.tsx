import { useModal } from '@hlb/design-system';
import { CreateContactModal } from '../components';
import type { ContactRow } from '../types';

export const useCreateContactModal = () => {
  const { openModal, closeModal, requestCloseModal } = useModal();

  const openCreateContactModal = (options?: { contact?: ContactRow; onSuccess?: () => void }) => {
    openModal(
      <CreateContactModal
        contact={options?.contact}
        closeModal={closeModal}
        requestCloseModal={requestCloseModal}
        onSuccess={options?.onSuccess}
      />,
      { id: options?.contact ? `edit-contact-${options.contact.id}` : 'create-contact' },
    );
  };

  return { openCreateContactModal };
};
