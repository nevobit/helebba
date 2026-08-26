import { useEffect } from 'react';
import { Menus, useModal } from '@hlb/design-system';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Eye,
  FileText,
  Globe,
  Info,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CrmFunnel, CrmOpportunity } from '@hlb/contracts';
import { OpportunityModal } from '../OpportunityModal';
import { NoteModal } from '../NoteModal';
import { ActivityModal } from '../ActivityModal';
import { ConfirmDialog } from '../ConfirmDialog';
import { useCrmMutations } from '../../hooks';
import styles from './OpportunityDrawer.module.css';

type OpportunityDrawerProps = {
  opportunity: CrmOpportunity;
  funnel: CrmFunnel;
  onClose: () => void;
};

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const initials = (name?: string) =>
  (name ?? '')
    .trim()
    .slice(0, 2)
    .toUpperCase() || '·';

export const OpportunityDrawer = ({ opportunity, funnel, onClose }: OpportunityDrawerProps) => {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const { updateOpportunityStatus, deleteOpportunity, isUpdatingOpportunityStatus } =
    useCrmMutations();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const stages = [...funnel.stages].sort((a, b) => a.order - b.order);
  const currentIndex = stages.findIndex(
    (stage) => String(stage.id) === String(opportunity.stageId),
  );
  const stage = currentIndex >= 0 ? stages[currentIndex] : undefined;
  const autoProbability = opportunity.probability == null;
  const probability = opportunity.probability ?? stage?.probability ?? 0;
  const createdDate = new Date(opportunity.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const closeDate = opportunity.expectedCloseDate
    ? new Date(opportunity.expectedCloseDate).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '-';

  const setStatus = (status: 'won' | 'lost') =>
    updateOpportunityStatus(
      { funnelId: String(funnel.id), opportunityId: String(opportunity.id), status },
      { onSuccess: onClose },
    );

  const openDetail = () => navigate(`/crm/deals/${opportunity.id}`);

  const openEdit = () =>
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
        onConfirm={() => deleteOpportunity({ dealId: String(opportunity.id) })}
        closeModal={closeModal}
      />,
      { id: 'delete-crm-opportunity' },
    );

  const openNote = () =>
    openModal(
      <NoteModal dealId={String(opportunity.id)} closeModal={closeModal} />,
      { id: 'new-crm-note' },
    );

  const openActivity = () =>
    openModal(
      <ActivityModal dealId={String(opportunity.id)} closeModal={closeModal} />,
      { id: 'new-crm-activity' },
    );

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={`Oportunidad: ${opportunity.name}`}
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>{opportunity.name}</h2>
            <span className={styles.subtitle}>Creado {createdDate}</span>
          </div>
          <Menus>
            <Menus.Menu>
              <Menus.Toggle
                id="drawer-opportunity-menu"
                verticalIcon
                className={styles.menuButton}
                aria-label="Más opciones"
              />
              <Menus.List id="drawer-opportunity-menu" placement="bottom-end">
                <Menus.Item
                  id="detail"
                  leadingIcon={<Eye size={15} />}
                  onClick={openDetail}
                >
                  Ver
                </Menus.Item>
                <Menus.Item
                  id="edit"
                  leadingIcon={<Pencil size={15} />}
                  onClick={openEdit}
                >
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
        </header>

        <section className={styles.section}>
          <h3 className={styles.sectionLabel}>Contacta con {opportunity.name}</h3>
          <div className={styles.actionsGrid}>
            <div className={styles.actionItem}>
              <button className={styles.actionCircle} type="button" aria-label="Email">
                <Mail size={19} />
              </button>
              <span>Email</span>
            </div>
            <div className={styles.actionItem}>
              <button className={styles.actionCircle} type="button" aria-label="Llamada">
                <Phone size={19} />
              </button>
              <span>Llamada</span>
            </div>
            <div className={styles.actionItem}>
              <button className={styles.actionCircle} type="button" aria-label="Web">
                <Globe size={19} />
              </button>
              <span>Web</span>
            </div>
            <div className={styles.actionItem}>
              <button className={styles.actionCircle} type="button" aria-label="Mapa">
                <MapPin size={19} className={styles.actionMap} />
              </button>
              <span>Mapa</span>
            </div>
            <div className={styles.actionItem}>
              <button
                className={`${styles.actionCircle} ${styles.actionMore}`}
                type="button"
                aria-label="Más"
                title="Ver detalle completo"
                onClick={() => navigate(`/crm/deals/${opportunity.id}`)}
              >
                <ArrowRight size={19} />
              </button>
              <span>Más</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Cantidad</span>
              <strong className={styles.metricValue}>
                {money(opportunity.value, opportunity.currency)}
              </strong>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabelRow}>
                <span className={styles.metricLabel}>Probabilidad</span>
                <BarChart3 size={16} className={styles.metricIcon} />
              </span>
              <div className={styles.probabilityRow}>
                <strong className={styles.metricValue}>{probability}%</strong>
                <span className={styles.autoLabel}>
                  {autoProbability ? 'Auto' : 'Manual'}
                  <Info size={13} />
                </span>
              </div>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Asignado a</span>
              <div className={styles.assigneeRow}>
                <span className={styles.avatarMagenta}>
                  {initials(opportunity.assignedToName || opportunity.contactName)}
                </span>
                <strong className={styles.assigneeName}>
                  {opportunity.assignedToName || opportunity.contactName || 'Sin asignar'}
                </strong>
              </div>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabelRow}>
                <span className={styles.metricLabel}>Estimación cierre</span>
                <span className={styles.estimateDate}>
                  <CalendarDays size={13} />
                  {closeDate}
                </span>
              </span>
              <div className={styles.statusButtons}>
                <button
                  className={`${styles.statusBtn} ${styles.statusWon}`}
                  type="button"
                  disabled={isUpdatingOpportunityStatus}
                  onClick={() => setStatus('won')}
                >
                  Ganado
                </button>
                <button
                  className={`${styles.statusBtn} ${styles.statusLost}`}
                  type="button"
                  disabled={isUpdatingOpportunityStatus}
                  onClick={() => setStatus('lost')}
                >
                  Perdido
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.stageBar} aria-label="Progreso en el embudo">
            {stages.map((item, index) => {
              if (index < currentIndex)
                return <span key={String(item.id)} className={styles.stageDone} title={item.name} />;
              if (index === currentIndex)
                return (
                  <span key={String(item.id)} className={styles.stageActive}>
                    {item.name}
                  </span>
                );
              return <span key={String(item.id)} className={styles.stageSegment} />;
            })}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Crear nuevo</h3>
          <div className={styles.createGrid}>
            <button className={styles.createBtn} type="button" onClick={openNote}>
              <Pencil size={15} />
              Nota
            </button>
            <button className={styles.createBtn} type="button" onClick={openActivity}>
              <Zap size={15} />
              Actividad
            </button>
            <button
              className={styles.createBtn}
              type="button"
              disabled
              title="Disponible próximamente"
            >
              <Upload size={15} />
              Archivo
            </button>
          </div>
          <div className={styles.createGridSingle}>
            <button
              className={styles.createBtn}
              type="button"
              disabled
              title="Disponible próximamente"
            >
              <FileText size={15} />
              Documento
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Actividades</h3>
          <div className={styles.activitiesGrid}>
            <div className={styles.activityCol}>
              <strong className={styles.activityNumber}>0</strong>
              <span className={styles.activityLink}>Ver histórico &gt;</span>
            </div>
            <div className={styles.activityCol}>
              <strong className={styles.activityNumber}>0</strong>
              <span className={styles.activityLabel}>Pendiente</span>
            </div>
            <div className={styles.activityCol}>
              <strong className={styles.activityNumber}>0</strong>
              <span className={styles.activityLabel}>Cerradas</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Empresa</h3>
          <div className={styles.companyCard}>
            <span className={styles.avatarOrange}>{initials(opportunity.companyName)}</span>
            <strong className={styles.companyName}>{opportunity.companyName || 'Sin empresa'}</strong>
            <span className={styles.companyChevron} aria-hidden>
              ›
            </span>
          </div>
        </section>
      </aside>
    </>
  );
};
