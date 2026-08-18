import { useEffect } from 'react';
import { Button, useModal } from '@hlb/design-system';
import { BarChart3, Coins, Filter, List, LockKeyhole, MoreVertical, Plus } from 'lucide-react';
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
  const totalValue = opportunities.reduce((sum, item) => sum + item.value, 0);
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>{funnel.name}</h1>
        <div className={styles.actions}>
          <LockKeyhole size={18}/><span className={styles.avatar}>NM</span><button className={styles.addUser}>+</button>
          <div className={styles.views}><button className={styles.selectedView}><BarChart3 size={17}/></button><button><List size={17}/></button><button><Coins size={17}/></button></div>
          <details className={styles.funnelMenu}><summary>{funnel.name}</summary><div>{funnels.map(item=><Link key={String(item.id)} to={`/crm/funnels/${item.id}`}>{item.name}</Link>)}<Link to="/crm/funnel/new"><Plus size={16}/> Nuevo embudo</Link></div></details>
          <button className={styles.more}><MoreVertical size={18}/></button>
          <Button icon={<Plus size={16} />} onClick={() => add(String(funnel.stages[0]?.id))}>
            Nueva oportunidad
          </Button>
        </div>
      </header>
      <div className={styles.summary}><strong>{money(totalValue)} · {opportunities.length} {opportunities.length===1?'Oportunidad':'Oportunidades'}</strong><button><Filter size={17}/> Filtros</button></div>
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
