import { useEffect } from 'react';
import { Button, useModal } from '@hlb/design-system';
import { Plus } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { OpportunityModal } from '../../components/OpportunityModal';
import { useCrmFunnel, useCrmFunnels, useCrmMutations, useCrmOpportunities } from '../../hooks';
import styles from './FunnelBoard.module.css';
const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    value,
  );
const FunnelBoard = () => {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { data: funnels = [], isLoading: loadingFunnels } = useCrmFunnels();
  const effectiveId = funnelId ?? (funnels[0] ? String(funnels[0].id) : undefined);
  const { data: funnel, isLoading: loadingFunnel } = useCrmFunnel(effectiveId);
  const { data: opportunities = [] } = useCrmOpportunities(effectiveId);
  const { moveOpportunity } = useCrmMutations();
  const { openModal, closeModal } = useModal();
  useEffect(() => {
    if (!funnelId && funnels[0]) navigate(`/crm/funnels/${funnels[0].id}`, { replace: true });
  }, [funnelId, funnels, navigate]);
  if (loadingFunnels || loadingFunnel || !funnel)
    return <main className={styles.loading}>Cargando embudo...</main>;
  const add = (stageId: string) =>
    openModal(
      <OpportunityModal funnel={funnel} initialStageId={stageId} closeModal={closeModal} />,
      { id: 'new-crm-opportunity' },
    );
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span>CRM</span>
          <h1>Embudo de ventas</h1>
        </div>
        <div className={styles.actions}>
          <select
            value={String(funnel.id)}
            onChange={(event) => navigate(`/crm/funnels/${event.target.value}`)}
          >
            {funnels.map((item) => (
              <option key={String(item.id)} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </select>
          <Button icon={<Plus size={16} />} onClick={() => add(String(funnel.stages[0]?.id))}>
            Nueva oportunidad
          </Button>
        </div>
      </header>
      <div className={styles.subheader}>
        <div>
          <strong>{funnel.name}</strong>
          {funnel.isDefault && <span>Predeterminado</span>}
        </div>
        <Link to="/crm/funnel/new">+ Nuevo embudo</Link>
      </div>
      <section className={styles.board}>
        {[...funnel.stages]
          .sort((a, b) => a.order - b.order)
          .map((stage) => {
            const cards = opportunities.filter((item) => String(item.stageId) === String(stage.id));
            const total = cards.reduce((sum, item) => sum + item.value, 0);
            return (
              <article
                className={styles.column}
                key={String(stage.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const opportunityId = event.dataTransfer.getData('text/opportunity');
                  if (opportunityId)
                    moveOpportunity({
                      funnelId: String(funnel.id),
                      opportunityId,
                      stageId: stage.id,
                    });
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
                  {cards.map((card) => (
                    <div
                      className={styles.card}
                      key={String(card.id)}
                      draggable
                      onDragStart={(event) =>
                        event.dataTransfer.setData('text/opportunity', String(card.id))
                      }
                    >
                      <strong>{card.name}</strong>
                      <span>{card.contactName || 'Sin contacto'}</span>
                      <b>{money(card.value, card.currency)}</b>
                      {card.expectedCloseDate && (
                        <small>{new Date(card.expectedCloseDate).toLocaleDateString()}</small>
                      )}
                    </div>
                  ))}
                  {!cards.length && <div className={styles.empty}>Arrastra oportunidades aquí</div>}
                </div>
              </article>
            );
          })}
      </section>
    </main>
  );
};
export default FunnelBoard;
