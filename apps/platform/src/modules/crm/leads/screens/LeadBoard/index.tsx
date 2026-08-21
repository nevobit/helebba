import { useEffect, useRef, useState } from 'react';
import { Button, useModal } from '@hlb/design-system';
import { Filter, List, Plus, User, Target, Calendar, Coins } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CrmLead } from '@hlb/contracts';
import { LeadModal } from '../../components/LeadModal';
import OpportunityDrawer from '../../components/OpportunityDrawer';
import { useCrmLeadMutations, useCrmLeads } from '../../hooks';
import { useCrmFunnels } from '@/modules/crm/funnels/hooks';
import styles from './LeadBoard.module.css';

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    value,
  );

const LeadBoard = () => {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { data: funnels = [], isLoading: loadingFunnels } = useCrmFunnels();
  const effectiveId = funnelId ?? (funnels[0] ? String(funnels[0].id) : undefined);
  const { data: leadsData } = useCrmLeads({ funnelId: effectiveId });
  const leads = leadsData?.data || [];
  const { moveStage } = useCrmLeadMutations();
  const { openModal, closeModal } = useModal();
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!funnelId && funnels[0]) navigate(`/crm/funnels/${funnels[0].id}`, { replace: true });
  }, [funnelId, funnels, navigate]);

  if (loadingFunnels) {
    return <main className={styles.loading}>Cargando embudos...</main>;
  }

  const funnel = funnels.find((f) => String(f.id) === effectiveId);
  if (!funnel) {
    return <main className={styles.loading}>Embudo no encontrado...</main>;
  }

  const add = (stageId: string) =>
    openModal(<LeadModal funnel={funnel} initialStageId={stageId} closeModal={closeModal} />, {
      id: 'new-crm-lead',
    });

  const totalValue = leads.reduce((sum, item) => sum + item.value, 0);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>{funnel.name}</h1>
        <div className={styles.actions}>
          <div className={styles.views}>
            <button className={styles.selectedView}>
              <Target size={17} />
            </button>
            <button>
              <List size={17} />
            </button>
            <button>
              <Coins size={17} />
            </button>
          </div>
          <details className={styles.funnelMenu}>
            <summary>
              <span>{funnel.name}</span>
            </summary>
            <div>
              {funnels.map((item: any) => (
                <Link key={String(item.id)} to={`/crm/funnels/${item.id}`}>
                  {item.name}
                </Link>
              ))}
              <Link to="/crm/funnels/new">
                <span>+ Nuevo embudo</span>
              </Link>
            </div>
          </details>
          <Button icon={<Plus size={16} />} onClick={() => add(String(funnel.stages[0]?.id))}>
            Nueva oportunidad
          </Button>
        </div>
      </header>
      <div className={styles.summary}>
        <strong>
          {money(totalValue)} · {leads.length}{' '}
          {leads.length === 1 ? 'Oportunidad' : 'Oportunidades'}
        </strong>
        <button>
          <Filter size={17} />
          Filtros
        </button>
      </div>
      <section className={styles.board}>
        {[...funnel.stages]
          .sort((a, b) => a.order - b.order)
          .map((stage) => {
            const cards = leads.filter((item: any) => String(item.stageId) === String(stage.id));
            const total = cards.reduce((sum: number, item: any) => sum + item.value, 0);
            return (
              <article
                className={styles.column}
                key={String(stage.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const leadId = event.dataTransfer.getData('text/lead');
                  if (leadId) {
                    moveStage({
                      id: leadId,
                      stageId: stage.id,
                    });
                  }
                }}
              >
                <div className={styles.columnHeader}>
                  <i style={{ background: stage.color }} />
                  <div>
                    <strong>
                      {stage.name} <span>{cards.length}</span>
                    </strong>
                    <small>{money(total)}</small>
                  </div>
                  <button onClick={() => add(String(stage.id))}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className={styles.cards}>
                  {cards.map((card: any) => (
                    <div
                      className={styles.card}
                      key={String(card.id)}
                      draggable
                      onPointerDown={(e) => {
                        pointerStart.current = { x: e.clientX, y: e.clientY };
                      }}
                      onPointerUp={(e) => {
                        if (pointerStart.current) {
                          const dx = Math.abs(e.clientX - pointerStart.current.x);
                          const dy = Math.abs(e.clientY - pointerStart.current.y);
                          if (dx < 5 && dy < 5) {
                            setSelectedLead(card);
                          }
                          pointerStart.current = null;
                        }
                      }}
                      onDragStart={(event) =>
                        event.dataTransfer.setData('text/lead', String(card.id))
                      }
                    >
                      <strong>{card.name}</strong>
                      <span>
                        <User size={14} />
                        {card.contactName || 'Sin contacto'}
                      </span>
                      <b>{money(card.value, card.currency)}</b>
                      {card.expectedCloseDate && (
                        <small>
                          <Calendar size={12} />
                          {new Date(card.expectedCloseDate).toLocaleDateString()}
                        </small>
                      )}
                      {card.potential && (
                        <small>
                          <Target size={12} />
                          {card.potential}%
                        </small>
                      )}
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className={styles.empty}>Arrastra oportunidades aquí</div>
                  )}
                </div>
              </article>
            );
          })}
      </section>

      {selectedLead && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setSelectedLead(null)}
            aria-hidden="true"
          />
          <OpportunityDrawer
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        </>
      )}
    </main>
  );
};

export default LeadBoard;
