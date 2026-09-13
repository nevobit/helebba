import { useMemo, useState } from 'react';
import type { CrmOpportunity } from '@hlb/contracts';
import { Button, Modal } from '@hlb/design-system';
import { UserRoundCheck } from 'lucide-react';

import { useOrganizationUsers } from '@/modules/settings/users/hooks';

import { useCrmMutations } from '../../hooks';
import { avatarColorFor, initialsFor } from '../../utils';
import styles from './ReassignOpportunityModal.module.css';

type Props = {
  opportunity: CrmOpportunity;
  closeModal: () => void;
};

export const ReassignOpportunityModal = ({
  opportunity,
  closeModal,
}: Props) => {
  const { users, isLoading } = useOrganizationUsers();
  const { updateOpportunity, isUpdatingOpportunity } = useCrmMutations();
  const [assignedToName, setAssignedToName] = useState(
    opportunity.assignedToName ?? '',
  );
  const [error, setError] = useState('');

  const activeUsers = useMemo(
    () => users.filter((user) => user.status === 'active'),
    [users],
  );

  const save = async () => {
    setError('');
    try {
      await updateOpportunity({
        dealId: String(opportunity.id),
        payload: { assignedToName },
      });
      closeModal();
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel="Reasignar oportunidad"
      className={styles.modal}
      size={{ width: '46rem', maxWidth: 'calc(100vw - 3.2rem)' }}
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
    >
      <Modal.Header>
        <div className={styles.heading}>
          <span className={styles.headingIcon}>
            <UserRoundCheck size={20} />
          </span>
          <div>
            <h2>Reasignar oportunidad</h2>
            <p>{opportunity.name}</p>
          </div>
        </div>
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        <p className={styles.label}>Asignar a</p>
        {isLoading ? (
          <p className={styles.hint}>Cargando agentes…</p>
        ) : (
          <div className={styles.users}>
            <label className={styles.user}>
              <span className={styles.unassigned}>
                <UserRoundCheck size={17} />
              </span>
              <span className={styles.userInfo}>
                <strong>Sin asignar</strong>
                <small>Quitar el agente actual</small>
              </span>
              <input
                type="radio"
                name="assignee"
                checked={!assignedToName}
                onChange={() => setAssignedToName('')}
              />
            </label>

            {activeUsers.map((user) => (
              <label className={styles.user} key={String(user.userId)}>
                <span
                  className={styles.avatar}
                  style={{ background: avatarColorFor(String(user.userId)) }}
                >
                  {initialsFor(user.name)}
                </span>
                <span className={styles.userInfo}>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </span>
                <input
                  type="radio"
                  name="assignee"
                  checked={assignedToName === user.name}
                  onChange={() => setAssignedToName(user.name)}
                />
              </label>
            ))}
          </div>
        )}
        {error ? <p className={styles.error}>{error}</p> : null}
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
        <Button variant="outline" theme="optional" onClick={closeModal}>
          Cancelar
        </Button>
        <Button loading={isUpdatingOpportunity} onClick={() => void save()}>
          Reasignar
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};
