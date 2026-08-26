import { useMemo, useState } from 'react';
import { Menus, Spinner, useModal } from '@hlb/design-system';
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CrmOpportunityNote } from '@hlb/contracts';
import {
  useCrmActivities,
  useCrmDeal,
  useCrmDealNotes,
  useCrmFunnel,
  useCrmMutations,
} from '../../hooks';
import { NoteModal } from '../../components/NoteModal';
import { OpportunityModal } from '../../components/OpportunityModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ActivityModal } from '../../components/ActivityModal';
import { useOrganizationUsers } from '@/modules/settings/users/hooks';
import styles from './OpportunityDetail.module.css';

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const initials = (name?: string) => (name ?? '').trim().slice(0, 2).toUpperCase() || '·';

type TimelineFilter = 'all' | 'notes' | 'activities';

const OpportunityDetail = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { data: opportunity, isLoading: loadingOpportunity } = useCrmDeal(dealId);
  const { data: funnel } = useCrmFunnel(opportunity ? String(opportunity.funnelId) : undefined);
  const { data: notes = [], isLoading: loadingNotes } = useCrmDealNotes(dealId);
  const { data: dealActivities = [] } = useCrmActivities(dealId);
  const { users: organizationUsers } = useOrganizationUsers();
  const {
    moveOpportunity,
    updateOpportunityStatus,
    deleteOpportunity,
    deleteOpportunityNote,
    updateOpportunity,
  } = useCrmMutations();
  const activeUsers = useMemo(
    () => organizationUsers.filter((user) => user.status === 'active'),
    [organizationUsers],
  );
  const { openModal, closeModal } = useModal();
  const [filter, setFilter] = useState<TimelineFilter>('all');

  const usersById = useMemo(
    () => new Map(organizationUsers.map((user) => [String(user.userId), user])),
    [organizationUsers],
  );

  if (loadingOpportunity || !opportunity || !funnel)
    return (
      <main className={styles.loading}>
        <Spinner />
      </main>
    );

  const stages = [...funnel.stages].sort((a, b) => a.order - b.order);
  const currentIndex = stages.findIndex(
    (stage) => String(stage.id) === String(opportunity.stageId),
  );
  const createdDate = new Date(opportunity.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const funnelId = String(opportunity.funnelId);

  const setStatus = (status: 'won' | 'lost') =>
    updateOpportunityStatus(
      { funnelId, opportunityId: String(opportunity.id), status },
      { onSuccess: () => navigate(`/crm/funnels/${funnelId}`) },
    );

  const moveToStage = (stageId: string) =>
    moveOpportunity({
      funnelId,
      opportunityId: String(opportunity.id),
      stageId: stageId as never,
    });

  const openNoteModal = () =>
    openModal(<NoteModal dealId={String(opportunity.id)} closeModal={closeModal} />, {
      id: 'new-crm-note',
    });

  const openEditNote = (note: CrmOpportunityNote) =>
    openModal(
      <NoteModal dealId={String(opportunity.id)} note={note} closeModal={closeModal} />,
      { id: 'edit-crm-note' },
    );

  const confirmDeleteNote = (note: CrmOpportunityNote) =>
    openModal(
      <ConfirmDialog
        title="Eliminar nota"
        message={`¿Seguro que quieres eliminar la nota "${note.title || 'Sin título'}"?`}
        onConfirm={() =>
          deleteOpportunityNote({ dealId: String(opportunity.id), noteId: String(note.id) })
        }
        closeModal={closeModal}
      />,
      { id: 'delete-crm-note' },
    );

  const openActivityModal = () =>
    openModal(<ActivityModal dealId={String(opportunity.id)} closeModal={closeModal} />, {
      id: 'new-crm-activity',
    });

  const openEditModal = () =>
    openModal(
      <OpportunityModal
        funnel={funnel}
        opportunity={opportunity}
        initialStageId={String(opportunity.stageId)}
        closeModal={closeModal}
      />,
      { id: 'edit-crm-opportunity' },
    );

  const confirmDelete = () =>
    openModal(
      <ConfirmDialog
        title="Eliminar oportunidad"
        message={`¿Seguro que quieres eliminar "${opportunity.name}"? Esta acción no se puede deshacer.`}
        onConfirm={async () => {
          await deleteOpportunity({ dealId: String(opportunity.id) });
          navigate(`/crm/funnels/${funnelId}`);
        }}
        closeModal={closeModal}
      />,
      { id: 'delete-crm-opportunity' },
    );

  const authorName = (createdBy: string) =>
    usersById.get(String(createdBy))?.name ?? String(createdBy);

  const visibleNotes: CrmOpportunityNote[] = notes;
  const activities = [...dealActivities].sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );
  const showNotes = filter === 'all' || filter === 'notes';
  const showActivities = filter === 'all' || filter === 'activities';
  const timelineIsEmpty =
    (!showNotes || visibleNotes.length === 0) && (!showActivities || activities.length === 0);

  return (
    <main className={styles.page}>
      <Link to={`/crm/funnels/${funnelId}`} className={styles.back}>
        <ChevronLeft size={18} />
        {funnel.name}
      </Link>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <h1>{opportunity.name}</h1>
            <Menus>
              <Menus.Menu>
                <Menus.Toggle
                  id="detail-opportunity-menu"
                  verticalIcon
                  className={styles.iconButton}
                  aria-label="Más opciones"
                />
                <Menus.List id="detail-opportunity-menu" placement="bottom-end">
                  <Menus.Item id="edit" leadingIcon={<Pencil size={15} />} onClick={openEditModal}>
                    Editar
                  </Menus.Item>
                  <Menus.Item
                    id="delete"
                    danger
                    leadingIcon={<Trash2 size={15} />}
                    onClick={confirmDelete}
                  >
                    Eliminar
                  </Menus.Item>
                </Menus.List>
              </Menus.Menu>
            </Menus>
          </div>

          <div className={styles.sidebarChips}>
            {opportunity.companyName && (
              <span className={styles.companyChip}>
                <span className={styles.companyAvatar}>{initials(opportunity.companyName)}</span>
                {opportunity.companyName}
              </span>
            )}
            <button type="button" className={styles.personButton}>
              <Plus size={15} />
              Persona
            </button>
          </div>

          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Fecha de creación</span>
            <span className={styles.metaValue}>{createdDate}</span>
          </div>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Embudo</span>
            <Link to={`/crm/funnels/${funnelId}`} className={styles.metaLink}>
              {funnel.name}
            </Link>
          </div>
          <div className={styles.metaBlock}>
            <span className={styles.metaLabel}>Valor</span>
            <span className={styles.metaValue}>
              {money(opportunity.value, opportunity.currency)}
            </span>
          </div>

          <div className={styles.sectionDivider} />

          <h2 className={styles.sidebarTitle}>Campos personalizados</h2>
          <button type="button" className={styles.customFieldsButton}>
            Añadir campos personalizados
          </button>

          <h2 className={styles.sidebarTitle}>Usuario asignado</h2>
          <div className={styles.assigneeRow}>
            <span className={styles.assigneeAvatar}>
              {initials(opportunity.assignedToName || opportunity.contactName)}
            </span>
            <strong>{opportunity.assignedToName || 'Sin asignar'}</strong>
            <Menus>
              <Menus.Menu>
                <Menus.Toggle
                  id="assignee-menu"
                  verticalIcon
                  className={styles.iconButton}
                  aria-label="Cambiar usuario asignado"
                />
                <Menus.List id="assignee-menu" placement="bottom-end" maxHeight={280}>
                  {activeUsers.map((user) => (
                    <Menus.Item
                      key={String(user.userId)}
                      id={`assignee-${String(user.userId)}`}
                      onClick={() =>
                        updateOpportunity({
                          dealId: String(opportunity.id),
                          payload: { assignedToName: user.name },
                        })
                      }
                    >
                      {user.name}
                    </Menus.Item>
                  ))}
                  <Menus.Item
                    id="assignee-none"
                    danger
                    onClick={() =>
                      updateOpportunity({
                        dealId: String(opportunity.id),
                        payload: { assignedToName: '' },
                      })
                    }
                  >
                    Sin asignar
                  </Menus.Item>
                </Menus.List>
              </Menus.Menu>
            </Menus>
          </div>
        </aside>

        <section className={styles.content}>
          <div className={styles.stageRow}>
            <div className={styles.stageBar}>
              {stages.map((stage, index) => (
                <button
                  key={String(stage.id)}
                  type="button"
                  className={cx(styles.stageSegment, index <= currentIndex && styles.stageDone)}
                  onClick={() => index !== currentIndex && moveToStage(String(stage.id))}
                >
                  {stage.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={cx(styles.statusBox, styles.statusWon)}
              aria-label="Marcar como ganada"
              onClick={() => setStatus('won')}
            >
              <Check size={20} />
            </button>
            <button
              type="button"
              className={cx(styles.statusBox, styles.statusLost)}
              aria-label="Marcar como perdida"
              onClick={() => setStatus('lost')}
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.timelineHead}>
            <h2>Historia</h2>
            <button
              type="button"
              className={styles.addButton}
              aria-label="Añadir nota"
              title="Nueva actividad"
              onClick={openActivityModal}
            >
              <Plus size={20} />
            </button>
          </div>

          <div className={styles.chips} role="tablist" aria-label="Filtrar historia">
            {(
              [
                ['all', 'Todos'],
                ['notes', 'Notas'],
                ['activities', 'Actividades'],
                ['files', 'Archivos'],
                ['documents', 'Documentos'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                disabled={key === 'files' || key === 'documents'}
                className={cx(styles.chip, filter === key && styles.chipActive)}
                onClick={() =>
                  (key === 'all' || key === 'notes' || key === 'activities') && setFilter(key)
                }
              >
                {label}
              </button>
            ))}
          </div>

          {timelineIsEmpty && !loadingNotes ? (
            <div className={styles.emptyTimeline}>
              <h3>
                {filter === 'notes' ? 'Crea tu primera nota' : 'Programa tu primera actividad'}
              </h3>
              <button
                type="button"
                className={styles.createNoteButton}
                onClick={filter === 'notes' ? openNoteModal : openActivityModal}
              >
                <Plus size={16} />
                {filter === 'notes' ? 'Crear nota' : 'Nueva actividad'}
              </button>
              <div className={styles.emptyArt}>
                <span className={styles.emptyCard} />
                <span className={styles.emptyBadge}>
                  <StickyNote size={22} />
                </span>
              </div>
            </div>
          ) : (
            <ul className={styles.notes}>
              {showActivities &&
                activities.map((activity) => (
                  <li key={activity.id} className={styles.note}>
                    <span className={styles.activityIcon}>
                      <CalendarCheck size={17} />
                    </span>
                    <div className={styles.noteMain}>
                      <div className={styles.noteTitleRow}>
                        <strong className={styles.noteTitle}>{activity.title}</strong>
                        <span
                          className={
                            activity.completed ? styles.completedBadge : styles.pendingBadge
                          }
                        >
                          {activity.completed ? 'Completada' : 'Pendiente'}
                        </span>
                      </div>
                      <div className={styles.noteContent}>
                        {new Date(activity.startsAt).toLocaleString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' · '}
                        {activity.assignedToName || 'Sin asignar'}
                        {activity.notes && <p>{activity.notes}</p>}
                      </div>
                    </div>
                  </li>
                ))}
              {showNotes &&
                visibleNotes.map((note) => (
                  <li
                    key={String(note.id)}
                    className={styles.note}
                    onClick={() => openEditNote(note)}
                    title="Editar nota"
                  >
                    <span className={styles.noteIcon}>
                      <StickyNote size={16} />
                    </span>
                    <div className={styles.noteMain}>
                      <div className={styles.noteTitleRow}>
                        <span
                          className={styles.noteDot}
                          style={
                            note.color
                              ? { background: note.color, borderColor: note.color }
                              : undefined
                          }
                        />
                        <strong className={styles.noteTitle}>{note.title || 'Nota'}</strong>
                        <span className={styles.noteMeta}>
                          - Creado por {authorName(String(note.createdBy))} -{' '}
                          {new Date(note.createdAt).toLocaleString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={styles.noteContent}
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    </div>
                    <Menus>
                      <Menus.Menu>
                        <Menus.Toggle
                          id={`note-menu-${String(note.id)}`}
                          verticalIcon
                          className={styles.iconButton}
                          aria-label="Opciones de la nota"
                        />
                        <Menus.List id={`note-menu-${String(note.id)}`} placement="bottom-end">
                          <Menus.Item
                            id="edit"
                            leadingIcon={<Pencil size={15} />}
                            onClick={() => openEditNote(note)}
                          >
                            Editar
                          </Menus.Item>
                          <Menus.Item
                            id="delete"
                            danger
                            leadingIcon={<Trash2 size={15} />}
                            onClick={() => confirmDeleteNote(note)}
                          >
                            Eliminar
                          </Menus.Item>
                        </Menus.List>
                      </Menus.Menu>
                    </Menus>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default OpportunityDetail;
