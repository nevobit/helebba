import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@hlb/design-system';
import { Info, Plus, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCrmMutations } from '../../hooks';
import { avatarColorFor, initialsFor } from '../../utils';
import { useOrganizationUsers } from '@/modules/settings/users/hooks';
import styles from './NewFunnel.module.css';

type StageDraft = {
  name: string;
  color: string;
  probability: number;
  description: string;
  stagnationEnabled: boolean;
  stagnationDays: number;
};

const defaults: StageDraft[] = [
  {
    name: 'Lead',
    color: '#6172F3',
    probability: 100,
    description: '',
    stagnationEnabled: false,
    stagnationDays: 5,
  },
  {
    name: 'Contacto establecido',
    color: '#2E90FA',
    probability: 100,
    description: '',
    stagnationEnabled: false,
    stagnationDays: 5,
  },
  {
    name: 'Necesidades definidas',
    color: '#F79009',
    probability: 100,
    description: '',
    stagnationEnabled: false,
    stagnationDays: 5,
  },
  {
    name: 'Propuesta realizada',
    color: '#9E77ED',
    probability: 100,
    description: '',
    stagnationEnabled: false,
    stagnationDays: 5,
  },
  {
    name: 'Negociaciones comenzadas',
    color: '#12B76A',
    probability: 100,
    description: '',
    stagnationEnabled: false,
    stagnationDays: 5,
  },
];

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

const NewFunnel = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [stages, setStages] = useState<StageDraft[]>(defaults);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const [error, setError] = useState('');
  const membersRef = useRef<HTMLDivElement>(null);
  const { createFunnel, isCreatingFunnel } = useCrmMutations();
  const { users: organizationUsers } = useOrganizationUsers();

  const activeUsers = useMemo(
    () => organizationUsers.filter((user) => user.status === 'active'),
    [organizationUsers],
  );
  const usersById = useMemo(
    () => new Map(activeUsers.map((user) => [String(user.userId), user])),
    [activeUsers],
  );

  useEffect(() => {
    if (!membersOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!membersRef.current?.contains(event.target as Node)) setMembersOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [membersOpen]);

  const toggleMember = (userId: string) =>
    setMemberIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );

  const update = (index: number, patch: Partial<StageDraft>) =>
    setStages((current) =>
      current.map((stage, position) => (position === index ? { ...stage, ...patch } : stage)),
    );

  const addStage = () =>
    setStages((current) => [
      ...current,
      {
        name: `Etapa ${current.length + 1}`,
        color: '#667085',
        probability: 100,
        description: '',
        stagnationEnabled: false,
        stagnationDays: 5,
      },
    ]);

  const save = async () => {
    if (!name.trim()) return setError('Ingresa el nombre del embudo.');
    if (stages.some((stage) => !stage.name.trim()))
      return setError('Todas las etapas deben tener un nombre.');
    try {
      const funnel = await createFunnel({
        name: name.trim(),
        description: '',
        members: (memberIds.length ? memberIds : undefined) as never,
        stages: stages.map((stage, index) => ({
          name: stage.name.trim(),
          color: stage.color,
          probability: stage.probability,
          description: stage.description.trim() || undefined,
          stagnationDays: stage.stagnationEnabled ? stage.stagnationDays : undefined,
          order: index,
        })) as never,
      });
      navigate(`/crm/funnels/${funnel.id}`);
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarFields}>
          <input
            className={cx(styles.control, styles.nameInput)}
            placeholder="Nuevo embudo"
            aria-label="Nombre del embudo"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <select
            className={styles.control}
            aria-label="Visibilidad del embudo"
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
          >
            <option value="public">Público</option>
            <option value="private">Privado</option>
          </select>
        </div>
        <div className={styles.toolbarActions}>
          <Button variant="outline" theme="optional" onClick={() => navigate('/crm/funnels')}>
            Cancelar
          </Button>
          <Button loading={isCreatingFunnel} onClick={save}>
            Guardar
          </Button>
        </div>
      </header>

      <div className={styles.membersBar}>
        <span className={styles.membersLabel}>Usuarios asignados</span>
        <div className={styles.membersAvatars}>
          {memberIds.map((memberId) => (
            <span
              key={memberId}
              className={styles.membersAvatar}
              style={{ background: avatarColorFor(memberId) }}
              title={usersById.get(memberId)?.name}
            >
              {initialsFor(usersById.get(memberId)?.name ?? memberId)}
            </span>
          ))}
          {!memberIds.length && <span className={styles.membersHint}>Solo tú</span>}
        </div>
        <div className={styles.membersPicker} ref={membersRef}>
          <button
            type="button"
            className={styles.membersToggle}
            aria-expanded={membersOpen}
            onClick={() => setMembersOpen((open) => !open)}
          >
            <Plus size={14} />
            Añadir
          </button>
          {membersOpen && (
            <div className={styles.membersMenu}>
              {activeUsers.length === 0 && (
                <p className={styles.membersHint}>No hay usuarios en la organización.</p>
              )}
              {activeUsers.map((user) => (
                <label key={String(user.userId)} className={styles.membersRow}>
                  <input
                    type="checkbox"
                    checked={memberIds.includes(String(user.userId))}
                    onChange={() => toggleMember(String(user.userId))}
                  />
                  <span
                    className={styles.membersAvatar}
                    style={{ background: avatarColorFor(String(user.userId)) }}
                  >
                    {initialsFor(user.name)}
                  </span>
                  <span className={styles.membersName}>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className={styles.board}>
        <div className={styles.stages}>
          {stages.map((stage, index) => (
            <article className={styles.stage} key={index}>
              <div className={styles.stageHeadWrap}>
                <header className={cx(styles.stageHead, index === 0 && styles.stageHeadFirst)}>
                  <h2>{stage.name || `Etapa ${index + 1}`}</h2>
                  <p>
                    <span
                      className={styles.stageColor}
                      style={{ background: stage.color }}
                      aria-hidden
                    />
                    <Scale size={13} />
                    {stage.probability}%
                  </p>
                </header>
              </div>
              <div className={styles.stageBody}>
                <label className={styles.field}>
                  <span className={styles.label}>Nombre</span>
                  <input
                    className={styles.control}
                    value={stage.name}
                    aria-label={`Nombre de la etapa ${index + 1}`}
                    onChange={(event) => update(index, { name: event.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Descripción</span>
                  <input
                    className={styles.control}
                    value={stage.description}
                    aria-label={`Descripción de la etapa ${index + 1}`}
                    onChange={(event) => update(index, { description: event.target.value })}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>
                    Probabilidad de la oportunidad
                    <Info size={13} className={styles.labelIcon} />
                  </span>
                  <input
                    className={styles.control}
                    type="number"
                    min="0"
                    max="100"
                    value={stage.probability}
                    aria-label={`Probabilidad de la etapa ${index + 1}`}
                    onChange={(event) => update(index, { probability: Number(event.target.value) })}
                  />
                </label>
                <div className={styles.field}>
                  <span className={styles.label}>
                    Estancado durante (días)
                    <Info size={13} className={styles.labelIcon} />
                  </span>
                  <div className={styles.stagnation}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={stage.stagnationEnabled}
                      aria-label={`Estancado durante días en etapa ${index + 1}`}
                      className={cx(styles.toggle, stage.stagnationEnabled && styles.toggleOn)}
                      onClick={() =>
                        update(index, { stagnationEnabled: !stage.stagnationEnabled })
                      }
                    >
                      <span className={styles.toggleThumb} />
                    </button>
                    {stage.stagnationEnabled && (
                      <input
                        className={styles.control}
                        type="number"
                        min="1"
                        value={stage.stagnationDays}
                        aria-label={`Días de estancamiento en etapa ${index + 1}`}
                        onChange={(event) =>
                          update(index, { stagnationDays: Number(event.target.value) })
                        }
                      />
                    )}
                  </div>
                </div>
                <label className={styles.colorPicker}>
                  <input
                    type="color"
                    value={stage.color}
                    aria-label={`Color de la etapa ${index + 1}`}
                    onChange={(event) => update(index, { color: event.target.value })}
                  />
                  Color de la etapa
                </label>
              </div>
            </article>
          ))}
        </div>

        <aside className={styles.addStagePanel}>
          <h2>Añadir etapa</h2>
          <p>Las etapas del embudo representan el estado de tus ventas</p>
          <Button icon={<Plus size={16} />} onClick={addStage}>
            Nueva etapa
          </Button>
        </aside>
      </section>

      {error && <p className={styles.error}>{error}</p>}
    </main>
  );
};

export default NewFunnel;
