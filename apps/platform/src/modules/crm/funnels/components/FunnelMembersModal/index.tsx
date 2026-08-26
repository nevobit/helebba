import { useMemo, useState } from 'react';
import { Button, Modal } from '@hlb/design-system';
import { UserSearch } from 'lucide-react';
import { useOrganizationUsers } from '@/modules/settings/users/hooks';
import { useCrmMutations } from '../../hooks';
import { avatarColorFor, initialsFor } from '../../utils';
import styles from './FunnelMembersModal.module.css';

type FunnelMembersModalProps = {
  funnelId: string;
  memberIds: string[];
  closeModal: () => void;
};

export const FunnelMembersModal = ({
  funnelId,
  memberIds,
  closeModal,
}: FunnelMembersModalProps) => {
  const { users, isLoading } = useOrganizationUsers();
  const { updateFunnelMembers, isUpdatingFunnelMembers } = useCrmMutations();
  const [selected, setSelected] = useState<Set<string>>(new Set(memberIds));
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const activeUsers = useMemo(
    () => users.filter((user) => user.status === 'active'),
    [users],
  );
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return activeUsers;
    return activeUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
    );
  }, [activeUsers, search]);

  const toggle = (userId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });

  const save = async () => {
    try {
      await updateFunnelMembers({ funnelId, members: [...selected] });
      closeModal();
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel="Añadir gente al embudo"
      className={styles.modal}
      size={{ width: '64rem', maxWidth: 'calc(100vw - 3.2rem)' }}
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
    >
      <Modal.Header>
        <h2 className={styles.title}>Añadir gente al embudo</h2>
        <input
          className={styles.search}
          placeholder="Buscar"
          aria-label="Buscar usuarios"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Body className={styles.body}>
        {isLoading ? (
          <p className={styles.hint}>Cargando usuarios…</p>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.empty}>
            <UserSearch size={72} strokeWidth={1.2} className={styles.emptyIcon} />
            <h3>No se han encontrado usuarios.</h3>
            <p>
              Invita a los miembros de tu equipo a helebba para que puedan tener acceso a proyectos
              y a otras funciones de la plataforma
            </p>
            <a href="#settings:/users" className={styles.inviteLink}>
              Invita a tu equipo a helebba
            </a>
          </div>
        ) : (
          <ul className={styles.list}>
            {filteredUsers.map((user) => (
              <li key={String(user.userId)}>
                <label className={styles.row}>
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
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selected.has(String(user.userId))}
                    onChange={() => toggle(String(user.userId))}
                    aria-label={`Seleccionar a ${user.name}`}
                  />
                </label>
              </li>
            ))}
          </ul>
        )}
        {error && <p className={styles.error}>{error}</p>}
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <Button loading={isUpdatingFunnelMembers} onClick={() => void save()}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};
