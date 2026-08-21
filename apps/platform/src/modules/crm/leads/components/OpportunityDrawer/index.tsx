import { useEffect } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Edit3,
  FileText,
  Lightbulb,
  MoreVertical,
  Upload,
} from 'lucide-react';
import type { CrmLead } from '@hlb/contracts';
import styles from './OpportunityDrawer.module.css';

type OpportunityDrawerProps = {
  lead: CrmLead | null;
  onClose: () => void;
};

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const OpportunityDrawer = ({ lead, onClose }: OpportunityDrawerProps) => {
  useEffect(() => {
    if (!lead) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lead, onClose]);

  useEffect(() => {
    if (lead) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [lead]);

  if (!lead) return null;

  const createdDate = new Date(lead.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const stageName = lead.status === 'open' ? 'CONTACTO ESTABLECIDO' : lead.status === 'won' ? 'GANADO' : 'PERDIDO';

  return (
    <div className={styles.drawer} role="dialog" aria-label={`Oportunidad: ${lead.name}`} aria-modal="true">
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{lead.name}</h2>
          <span className={styles.subtitle}>Creado {createdDate}</span>
        </div>
        <button className={styles.menuButton} type="button" aria-label="Más opciones">
          <MoreVertical size={18} />
        </button>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionLabel}>Contacta con {lead.name}</h3>
        <div className={styles.actionsGrid}>
          <div className={styles.actionItem}>
            <button className={styles.actionCircle} type="button" aria-label="Email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </button>
            <span>Email</span>
          </div>
          <div className={styles.actionItem}>
            <button className={styles.actionCircle} type="button" aria-label="Llamada">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
            <span>Llamada</span>
          </div>
          <div className={styles.actionItem}>
            <button className={styles.actionCircle} type="button" aria-label="Web">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </button>
            <span>Web</span>
          </div>
          <div className={styles.actionItem}>
            <button className={styles.actionCircle} type="button" aria-label="Mapa">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1473D2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </button>
            <span>Mapa</span>
          </div>
          <div className={styles.actionItem}>
            <button className={`${styles.actionCircle} ${styles.actionMore}`} type="button" aria-label="Más">
              <ArrowRight size={20} />
            </button>
            <span>Más</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Cantidad</span>
            <strong className={styles.metricValue}>{money(lead.value, lead.currency)}</strong>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Probabilidad</span>
            <div className={styles.probabilityRow}>
              <strong className={styles.metricValue}>{lead.potential ?? 100}%</strong>
              <span className={styles.autoLabel}>Auto ⓘ</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Asignado a</span>
            <div className={styles.assigneeRow}>
              <div className={styles.avatarMagenta}>
                {(lead.assignedToName || 'NM').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <strong className={styles.assigneeName}>{lead.assignedToName || 'Nestor Mosquera'}</strong>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.estimateHeader}>
              <span className={styles.metricLabel}>Estimación cierre</span>
              <span className={styles.estimateDash}>-</span>
            </div>
            <div className={styles.statusButtons}>
              <button className={`${styles.statusBtn} ${styles.statusWon}`} type="button">Ganado</button>
              <button className={`${styles.statusBtn} ${styles.statusLost}`} type="button">Perdido</button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.pipelineProgress}>
          <div className={styles.stageBar}>
            <div className={`${styles.stageSegment} ${styles.stageLead}`}>
              <span>Lead</span>
            </div>
            <div className={`${styles.stageSegment} ${styles.stageActive}`}>
              <span>{stageName}</span>
            </div>
            <div className={styles.stageSegment}>
              <span>Necesidades definidas</span>
            </div>
            <div className={styles.stageSegment}>
              <span>Propuesta realizada</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Crear nuevo</h3>
        <div className={styles.createGrid}>
          <button className={styles.createBtn} type="button">
            <Edit3 size={16} />
            Nota
          </button>
          <button className={styles.createBtn} type="button">
            <Lightbulb size={16} />
            Actividad
          </button>
          <button className={styles.createBtn} type="button">
            <Upload size={16} />
            Archivo
          </button>
        </div>
        <div className={styles.createGridSingle}>
          <button className={styles.createBtn} type="button">
            <FileText size={16} />
            Documento
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Actividades</h3>
        <div className={styles.activitiesGrid}>
          <div className={styles.activityCol}>
            <strong className={styles.activityNumber}>0</strong>
            <a href="#" className={styles.activityLink}>Ver histórico &gt;</a>
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
          <div className={styles.avatarOrange}>RE</div>
          <strong className={styles.companyName}>{lead.companyName || lead.name}</strong>
          <ChevronRight size={18} className={styles.companyChevron} />
        </div>
      </section>
    </div>
  );
};

export default OpportunityDrawer;
