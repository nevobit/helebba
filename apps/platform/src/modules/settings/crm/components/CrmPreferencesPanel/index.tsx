import { useMemo, useState } from 'react';
import { Button, Modal } from '@hlb/design-system';
import {
  CalendarDays,
  ChevronRight,
  Martini,
  Plane,
  Plus,
  Save,
  Trash2,
  UsersRound,
  Utensils,
  Phone,
  X,
} from 'lucide-react';
import { useSession } from '@/shared';
import type { CrmActivityTypePreference, CrmSalesTeam } from '@hlb/contracts';
import { SETTINGS_CATEGORY_HASHES, SETTINGS_HOME_HASH } from '@/modules/settings/hooks';
import { useOrganizationUsers } from '@/modules/settings/users/hooks';
import { useCrmPreferences, useSaveCrmPreferences } from '../../hooks';
import styles from './CrmPreferencesPanel.module.css';

const icons = {
  phone: Phone,
  calendar: CalendarDays,
  plane: Plane,
  utensils: Utensils,
  martini: Martini,
  users: UsersRound,
};
const activityIconNames = ['phone', 'calendar', 'plane', 'utensils', 'martini'] as const;

type Props = { onClose: () => void };

export const CrmPreferencesPanel = ({ onClose }: Props) => {
  const organization = useSession((state) => state.organization);
  const { data, isLoading } = useCrmPreferences();
  const { users } = useOrganizationUsers();
  const savePreferences = useSaveCrmPreferences();
  const [draftTypes, setDraftTypes] = useState<CrmActivityTypePreference[] | null>(null);
  const [draftTeams, setDraftTeams] = useState<CrmSalesTeam[] | null>(null);
  const [teamModal, setTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#4180f3');
  const [teamLeaderId, setTeamLeaderId] = useState('');
  const [error, setError] = useState('');
  const types = useMemo(() => draftTypes ?? data?.activityTypes ?? [], [data, draftTypes]);
  const teams = useMemo(() => draftTeams ?? data?.salesTeams ?? [], [data, draftTeams]);
  const dirty = draftTypes !== null || draftTeams !== null;
  const navigate = (hash: string) => window.location.assign(`#${hash}`);
  const save = async () => {
    setError('');
    try {
      await savePreferences.mutateAsync({ activityTypes: types, salesTeams: teams });
      setDraftTypes(null);
      setDraftTeams(null);
    } catch (reason) {
      setError((reason as Error).message);
    }
  };
  const cancelChanges = () => {
    setDraftTypes(null);
    setDraftTeams(null);
    setError('');
  };

  return (
    <div className={styles.overlay} role="presentation">
      <aside className={styles.panel} aria-label="Preferencias de CRM">
        <header className={styles.header}>
          <div>
            <span>CONFIGURACIÓN</span>
            <strong>{organization?.name || 'Mi organización'}</strong>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" disabled={!dirty} onClick={cancelChanges}>
              Cancelar
            </Button>
            <Button
              icon={<Save size={16} />}
              disabled={!dirty}
              loading={savePreferences.isPending}
              onClick={() => void save()}
            >
              Guardar
            </Button>
            <button type="button" onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
        </header>
        <main className={styles.content}>
          <div className={styles.breadcrumb}>
            <button type="button" onClick={() => navigate(SETTINGS_HOME_HASH)}>
              Configuración
            </button>
            <ChevronRight size={16} />
            <button type="button" onClick={() => navigate(SETTINGS_CATEGORY_HASHES.crm)}>
              CRM
            </button>
            <ChevronRight size={16} />
            <span>Preferencias de CRM</span>
          </div>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Equipos de ventas</h2>
                <p>Crea tantos equipos como necesites para gestionar tu embudo de ventas.</p>
              </div>
              <Button
                variant="outline"
                icon={<Plus size={16} />}
                onClick={() => setTeamModal(true)}
              >
                Nuevo equipo
              </Button>
            </div>
            {teams.length > 0 && (
              <div className={styles.teams}>
                {teams.map((team) => (
                  <article key={team.id}>
                    <span>
                      <UsersRound size={22} />
                    </span>
                    <strong>{team.name}</strong>
                    <small>{team.members.length} miembros</small>
                    <button
                      type="button"
                      className={styles.teamDelete}
                      aria-label={`Eliminar ${team.name}`}
                      onClick={() => setDraftTeams(teams.filter((item) => item.id !== team.id))}
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Tipos de actividades</h2>
                <p>Gestiona tus tipos de actividades de eventos.</p>
              </div>
              <Button
                variant="outline"
                icon={<Plus size={16} />}
                onClick={() =>
                  setDraftTypes([
                    ...types,
                    {
                      id: crypto.randomUUID(),
                      name: 'Nueva actividad',
                      color: '#4180f3',
                      icon: 'calendar',
                    },
                  ])
                }
              >
                Añadir tipo de actividad
              </Button>
            </div>
            <div className={styles.tableHeader}>
              <span>Nombre</span>
              <span>Color</span>
              <span>Icono</span>
              <span />
            </div>
            {isLoading && <p className={styles.loading}>Cargando preferencias...</p>}
            {types.map((type, index) => {
              const Icon = icons[type.icon as keyof typeof icons] ?? CalendarDays;
              return (
                <div className={styles.row} key={`${type.name}-${index}`}>
                  <input
                    value={type.name}
                    onChange={(event) =>
                      setDraftTypes(
                        types.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <label className={styles.color}>
                    <input
                      type="color"
                      value={type.color}
                      onChange={(event) =>
                        setDraftTypes(
                          types.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, color: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <span>{type.color}</span>
                  </label>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => {
                      const current = activityIconNames.indexOf(
                        type.icon as (typeof activityIconNames)[number],
                      );
                      const icon = activityIconNames[(current + 1) % activityIconNames.length];
                      setDraftTypes(
                        types.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, icon } : item,
                        ),
                      );
                    }}
                  >
                    <Icon size={18} />
                    <ChevronRight size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles.delete}
                    aria-label={`Eliminar ${type.name}`}
                    onClick={() =>
                      setDraftTypes(types.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </section>
          {error && <p className={styles.error}>{error}</p>}
        </main>
      </aside>
      <Modal.Window
        isOpen={teamModal}
        ariaLabel="Nuevo equipo de ventas"
        size={{ width: '58rem' }}
        onClose={() => setTeamModal(false)}
      >
        <Modal.Header>
          <h2>Nuevo equipo de ventas</h2>
          <Modal.CloseButton onClick={() => setTeamModal(false)} />
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <label>
            Nombre
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              autoFocus
            />
          </label>
          <label>
            Color
            <input
              type="color"
              value={teamColor}
              onChange={(event) => setTeamColor(event.target.value)}
            />
          </label>
          <label>
            Líder de equipo
            <select value={teamLeaderId} onChange={(event) => setTeamLeaderId(event.target.value)}>
              <option value="">No asignado</option>
              {users.map((user) => (
                <option key={String(user.userId)} value={String(user.userId)}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Icono
            <button type="button">
              <UsersRound size={18} /> Equipo
            </button>
          </label>
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={!teamName.trim()}
            onClick={() => {
              setDraftTeams([
                ...teams,
                {
                  id: crypto.randomUUID(),
                  name: teamName.trim(),
                  color: teamColor,
                  icon: 'users',
                  leaderId: teamLeaderId ? (teamLeaderId as never) : undefined,
                  members: [],
                },
              ]);
              setTeamName('');
              setTeamColor('#4180f3');
              setTeamLeaderId('');
              setTeamModal(false);
            }}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal.Window>
    </div>
  );
};
