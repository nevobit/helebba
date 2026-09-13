import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Menus, useModal } from '@hlb/design-system';
import {
  BarChart3,
  ChevronDown,
  Coins,
  Copy,
  Filter,
  Handshake,
  List,
  LockKeyhole,
  Pencil,
  Phone,
  Plus,
  Search,
  Settings,
  SquareKanban,
  StickyNote,
  Trash2,
  Upload,
  UserRoundCheck,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { CrmOpportunity } from '@hlb/contracts';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FunnelEditModal } from '../../components/FunnelEditModal';
import { FunnelMembersModal } from '../../components/FunnelMembersModal';
import { ActivityModal } from '../../components/ActivityModal';
import { NoteModal } from '../../components/NoteModal';
import { OpportunityDrawer } from '../../components/OpportunityDrawer';
import { OpportunityModal } from '../../components/OpportunityModal';
import { ReassignOpportunityModal } from '../../components/ReassignOpportunityModal';
import { useCrmFunnel, useCrmFunnels, useCrmMutations, useCrmOpportunities } from '../../hooks';
import { avatarColorFor, initialsFor } from '../../utils';
import { useOrganizationUsers } from '@/modules/settings/users/hooks';
import styles from './FunnelBoard.module.css';

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

const money = (value: number, currency = 'COP') =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const formatDate = (value?: Date | string) =>
  value
    ? new Date(value).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '-';

const initials = (name?: string) =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '·';

const STATUS_LABELS: Record<CrmOpportunity['status'], string> = {
  open: 'Pendiente',
  won: 'Ganada',
  lost: 'Perdida',
};

const FunnelBoard = () => {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { data: funnels = [], isLoading: loadingFunnels } = useCrmFunnels();
  const effectiveId = funnelId ?? (funnels[0] ? String(funnels[0].id) : undefined);
  const { data: funnel, isLoading: loadingFunnel } = useCrmFunnel(effectiveId);
  const { data: opportunities = [] } = useCrmOpportunities(effectiveId);
  const { moveOpportunity, duplicateFunnel, removeFunnel } = useCrmMutations();
  const { openModal, closeModal } = useModal();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [view, setView] = useState('board');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ search: '', stageId: '', assignedTo: '' });
  const switcherRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<{ x: number; y: number } | null>(null);
  const { users: organizationUsers } = useOrganizationUsers();

  const usersById = useMemo(
    () => new Map(organizationUsers.map((user) => [String(user.userId), user])),
    [organizationUsers],
  );

  const stages = funnel ? [...funnel.stages].sort((a, b) => a.order - b.order) : [];

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return opportunities.filter((item) => {
      if (filters.stageId && String(item.stageId) !== filters.stageId) return false;
      if (filters.assignedTo && (item.assignedToName ?? '') !== filters.assignedTo) return false;
      if (term) {
        const haystack = [
          item.name,
          item.companyName,
          item.contactName,
          item.assignedToName,
          ...(item.tags ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [opportunities, filters]);

  const assigneeNames = useMemo(
    () =>
      [...new Set(opportunities.map((item) => item.assignedToName).filter(Boolean))] as string[],
    [opportunities],
  );

  const hasActiveFilters = Boolean(filters.search || filters.stageId || filters.assignedTo);
  const clearFilters = () => setFilters({ search: '', stageId: '', assignedTo: '' });
  const setFilter = (patch: Partial<typeof filters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  useEffect(() => {
    if (!funnelId && funnels[0]) navigate(`/crm/funnels/${funnels[0].id}`, { replace: true });
  }, [funnelId, funnels, navigate]);

  useEffect(() => {
    if (!switcherOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setSwitcherOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSwitcherOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [switcherOpen]);

  if (loadingFunnels || loadingFunnel || !funnel)
    return (
      <main className={styles.loading}>
        <span>Cargando embudo…</span>
      </main>
    );

  const add = (stageId: string) =>
    openModal(
      <OpportunityModal funnel={funnel} initialStageId={stageId} closeModal={closeModal} />,
      { id: 'new-crm-opportunity' },
    );

  const editOpportunity = (opportunity: CrmOpportunity) =>
    openModal(
      <OpportunityModal
        funnel={funnel}
        initialStageId={String(opportunity.stageId)}
        opportunity={opportunity}
        closeModal={closeModal}
      />,
      { id: `edit-crm-opportunity-${opportunity.id}` },
    );

  const reassignOpportunity = (opportunity: CrmOpportunity) =>
    openModal(
      <ReassignOpportunityModal opportunity={opportunity} closeModal={closeModal} />,
      { id: `reassign-crm-opportunity-${opportunity.id}` },
    );

  const addNote = (opportunity: CrmOpportunity) =>
    openModal(
      <NoteModal dealId={String(opportunity.id)} closeModal={closeModal} />,
      { id: `add-crm-note-${opportunity.id}` },
    );

  const addCall = (opportunity: CrmOpportunity) =>
    openModal(
      <ActivityModal
        dealId={String(opportunity.id)}
        initialType="call"
        initialTitle={`Llamada - ${opportunity.name}`}
        closeModal={closeModal}
      />,
      { id: `add-crm-call-${opportunity.id}` },
    );

  const totalValue = filtered.reduce((sum, item) => sum + item.value, 0);
  const selected = opportunities.find((item) => String(item.id) === selectedId) ?? null;

  const memberIds = (funnel.members ?? []).map(String);
  const visibleMembers = memberIds.slice(0, 3);
  const extraMembers = memberIds.length - visibleMembers.length;

  const openMembers = () =>
    openModal(
      <FunnelMembersModal
        funnelId={String(funnel.id)}
        memberIds={memberIds}
        closeModal={closeModal}
      />,
      { id: 'funnel-members' },
    );

  const openEditFunnel = () =>
    openModal(<FunnelEditModal funnel={funnel} closeModal={closeModal} />, { id: 'edit-funnel' });

  const openDuplicateFunnel = async () => {
    const copy = await duplicateFunnel({ funnelId: String(funnel.id) });
    navigate(`/crm/funnels/${copy.id}`);
  };

  const confirmDeleteFunnel = () =>
    openModal(
      <ConfirmDialog
        title="Eliminar embudo"
        message={`¿Seguro que quieres eliminar el embudo "${funnel.name}"? Sus oportunidades también se ocultarán.`}
        onConfirm={async () => {
          await removeFunnel({ funnelId: String(funnel.id) });
          navigate('/crm/funnels');
        }}
        closeModal={closeModal}
      />,
      { id: 'delete-funnel' },
    );

  const openOpportunity = (opportunity: CrmOpportunity, event: React.PointerEvent) => {
    const start = pressRef.current;
    pressRef.current = null;
    if (!start) return;
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (moved < 6) setSelectedId(String(opportunity.id));
  };

  const filtersBar = filtersOpen && (
    <div className={styles.filtersBar}>
      <div className={styles.filtersSearch}>
        <Search size={15} />
        <input
          placeholder="Buscar oportunidades…"
          aria-label="Buscar oportunidades"
          value={filters.search}
          onChange={(event) => setFilter({ search: event.target.value })}
        />
      </div>
      <select
        className={styles.filtersSelect}
        aria-label="Filtrar por etapa"
        value={filters.stageId}
        onChange={(event) => setFilter({ stageId: event.target.value })}
      >
        <option value="">Todas las etapas</option>
        {stages.map((stage) => (
          <option key={String(stage.id)} value={String(stage.id)}>
            {stage.name}
          </option>
        ))}
      </select>
      <select
        className={styles.filtersSelect}
        aria-label="Filtrar por asignado"
        value={filters.assignedTo}
        onChange={(event) => setFilter({ assignedTo: event.target.value })}
      >
        <option value="">Todos los asignados</option>
        {assigneeNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {hasActiveFilters && (
        <button type="button" className={styles.filtersClear} onClick={clearFilters}>
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>{funnel.name}</h1>
        <div className={styles.actions}>
          <span className={styles.lock} title="Embudo privado">
            <LockKeyhole size={18} />
          </span>
          <div className={styles.avatarStack}>
            {visibleMembers.map((memberId) => (
              <span
                key={memberId}
                className={styles.avatarUser}
                style={{ background: avatarColorFor(memberId) }}
                title={usersById.get(memberId)?.name}
              >
                {initialsFor(usersById.get(memberId)?.name ?? memberId)}
              </span>
            ))}
            {extraMembers > 0 && (
              <span className={styles.avatarUser} style={{ background: '#98a2b3' }}>
                +{extraMembers}
              </span>
            )}
            <button
              type="button"
              className={styles.avatarAdd}
              aria-label="Añadir usuarios al embudo"
              title="Añadir gente al embudo"
              onClick={openMembers}
            >
              <Plus size={13} />
            </button>
          </div>
          <div className={styles.views} role="group" aria-label="Tipo de vista">
            {(
              [
                ['board', BarChart3, 'Vista de embudo'],
                ['list', List, 'Vista de lista'],
                ['coins', Coins, 'Vista por importes'],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                aria-pressed={view === key}
                className={cx(styles.viewButton, view === key && styles.viewButtonActive)}
                onClick={() => setView(key)}
              >
                <Icon size={17} />
              </button>
            ))}
          </div>
          <div className={styles.switcher} ref={switcherRef}>
            <button
              type="button"
              className={styles.switcherButton}
              aria-haspopup="menu"
              aria-expanded={switcherOpen}
              onClick={() => setSwitcherOpen((open) => !open)}
            >
              {funnel.name}
              <ChevronDown size={15} />
            </button>
            {switcherOpen && (
              <div className={styles.switcherMenu} role="menu">
                {funnels.map((item) => (
                  <Link
                    key={String(item.id)}
                    role="menuitem"
                    to={`/crm/funnels/${item.id}`}
                    className={cx(
                      styles.switcherItem,
                      String(item.id) === String(funnel.id) && styles.switcherItemActive,
                    )}
                    onClick={() => setSwitcherOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className={styles.switcherDivider} />
                <Link
                  role="menuitem"
                  to="/crm/funnel/new"
                  className={styles.switcherItem}
                  onClick={() => setSwitcherOpen(false)}
                >
                  <Plus size={16} />
                  Nuevo embudo
                </Link>
              </div>
            )}
          </div>
          <Menus>
            <Menus.Menu>
              <Menus.Toggle
                id="funnel-menu"
                verticalIcon
                className={styles.more}
                aria-label="Más opciones"
              />
              <Menus.List id="funnel-menu" placement="bottom-end">
                <Menus.Item id="edit" leadingIcon={<Pencil size={15} />} onClick={openEditFunnel}>
                  Editar embudo
                </Menus.Item>
                <Menus.Item id="config" leadingIcon={<Settings size={15} />} disabled>
                  Configuración
                </Menus.Item>
                <Menus.Item
                  id="duplicate"
                  leadingIcon={<Copy size={15} />}
                  onClick={() => void openDuplicateFunnel()}
                >
                  Duplicar
                </Menus.Item>
                <Menus.Item
                  id="delete"
                  danger
                  leadingIcon={<Trash2 size={15} />}
                  onClick={confirmDeleteFunnel}
                >
                  Eliminar
                </Menus.Item>
                <Menus.Item id="import" leadingIcon={<Upload size={15} />} disabled>
                  Importar
                </Menus.Item>
              </Menus.List>
            </Menus.Menu>
          </Menus>
          <Button icon={<Plus size={16} />} onClick={() => add(String(funnel.stages[0]?.id))}>
            Nueva oportunidad
          </Button>
        </div>
      </header>

      <div className={styles.summary}>
        <p>
          {money(totalValue)} · {filtered.length}{' '}
          {filtered.length === 1 ? 'Oportunidad' : 'Oportunidades'}
        </p>
        <button
          type="button"
          className={cx(styles.filters, filtersOpen && styles.filtersActive)}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <Filter size={16} />
          Filtros
        </button>
      </div>

      {filtersBar}

      {view === 'list' ? (
        <section className={styles.listView}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thCheckbox}>
                    <input type="checkbox" aria-label="Seleccionar todo" />
                  </th>
                  <th>Nombre</th>
                  <th>Creado</th>
                  <th>Fecha de cierre prevista</th>
                  <th>Etapa</th>
                  <th>Empresa</th>
                  <th>Persona</th>
                  <th>Asignado a</th>
                  <th>Tags</th>
                  <th>Probabilidad</th>
                  <th>Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const stage = stages.find((s) => String(s.id) === String(item.stageId));
                  const probability = item.probability ?? stage?.probability ?? 0;
                  return (
                    <tr
                      key={String(item.id)}
                      className={styles.row}
                      onClick={() => navigate(`/crm/deals/${item.id}`)}
                    >
                      <td className={styles.tdCheckbox} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" aria-label={`Seleccionar ${item.name}`} />
                      </td>
                      <td className={styles.tdName}>{item.name}</td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>{formatDate(item.expectedCloseDate)}</td>
                      <td>{stage?.name ?? '-'}</td>
                      <td>{item.companyName || '-'}</td>
                      <td>{item.contactName || '-'}</td>
                      <td>{item.assignedToName || '-'}</td>
                      <td>{item.tags?.length ? item.tags.join(', ') : '-'}</td>
                      <td>{probability}%</td>
                      <td className={styles.tdValue}>{money(item.value, item.currency)}</td>
                      <td>
                        <span className={cx(styles.badge, styles[`badge-${item.status}`])}>
                          {STATUS_LABELS[item.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan={12} className={styles.emptyRow}>
                      No hay oportunidades que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={styles.listFooter}>
            <span className={styles.listCount}>
              1 - {filtered.length}({filtered.length})
            </span>
            <select className={styles.listPageSize} aria-label="Filas por página" defaultValue="100">
              <option value="100">100</option>
              <option value="50">50</option>
              <option value="25">25</option>
            </select>
          </div>
        </section>
      ) : (
        <section className={styles.board}>
          <div className={styles.columns}>
            {stages.map((stage, index) => {
              const cards = filtered.filter((item) => String(item.stageId) === String(stage.id));
              const total = cards.reduce((sum, item) => sum + item.value, 0);
              const isFirst = index === 0;
              const isLast = index === stages.length - 1;
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
                  <div className={styles.stageHeadWrap}>
                    <header
                      className={cx(
                        styles.stageHead,
                        isFirst && styles.stageHeadFirst,
                        isLast && styles.stageHeadLast,
                      )}
                    >
                      <h2>{stage.name}</h2>
                      <p>
                        {money(total)} · {cards.length}{' '}
                        {cards.length === 1 ? 'oportunidad' : 'oportunidades'}
                      </p>
                    </header>
                  </div>
                  <div className={styles.columnBody}>
                    {cards.map((card) => {
                      const limit = stage.stagnationDays;
                      const days = Math.floor(
                        (Date.now() - new Date(card.updatedAt ?? card.createdAt).getTime()) /
                          86_400_000,
                      );
                      const stagnantDays = limit && days >= limit ? days : null;
                      return (
                        <div
                          className={styles.card}
                          key={String(card.id)}
                          draggable
                          onDragStart={(event) =>
                            event.dataTransfer.setData('text/opportunity', String(card.id))
                          }
                          onPointerDown={(event) => {
                            pressRef.current = { x: event.clientX, y: event.clientY };
                          }}
                          onPointerUp={(event) => openOpportunity(card, event)}
                        >
                          <div className={styles.cardMain}>
                            <div className={styles.cardInfo}>
                              <strong>{card.name}</strong>
                              <span>{card.companyName || card.contactName || 'Sin contacto'}</span>
                              <div className={styles.cardFooter}>
                                {stagnantDays != null && (
                                  <span
                                    className={styles.cardStagnant}
                                    title={`Estancada ${stagnantDays} días (límite: ${limit})`}
                                  >
                                    {stagnantDays}d
                                  </span>
                                )}
                                <b>{money(card.value, card.currency)}</b>
                              </div>
                            </div>
                            <span className={styles.cardAvatar}>
                              {initials(card.assignedToName || card.contactName)}
                            </span>
                          </div>
                          <div
                            className={styles.cardActions}
                            draggable={false}
                            onPointerDown={(event) => {
                              event.stopPropagation();
                              pressRef.current = null;
                            }}
                            onPointerUp={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                            onDragStart={(event) => event.preventDefault()}
                          >
                            <button
                              type="button"
                              aria-label={`Reasignar ${card.name}`}
                              title="Reasignar"
                              onClick={() => reassignOpportunity(card)}
                            >
                              <UserRoundCheck size={14} />
                              <span>Reasignar</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Editar ${card.name}`}
                              title="Editar"
                              onClick={() => editOpportunity(card)}
                            >
                              <Pencil size={14} />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Agregar nota a ${card.name}`}
                              title="Agregar nota"
                              onClick={() => addNote(card)}
                            >
                              <StickyNote size={14} />
                              <span>Nota</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Registrar llamada para ${card.name}`}
                              title="Llamar"
                              onClick={() => addCall(card)}
                            >
                              <Phone size={14} />
                              <span>Llamar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {!cards.length && filtered.length > 0 && (
                      <div className={styles.dropHint}>Arrastra oportunidades aquí</div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyArt}>
                <div className={styles.emptyCircle}>
                  <SquareKanban size={54} strokeWidth={1.4} />
                </div>
                <span className={styles.emptyBadge}>
                  <Handshake size={16} />
                </span>
              </div>
              <h3>Oportunidades</h3>
              <p>
                Desde aquí puedes añadir nuevas oportunidades de venta y registrar su seguimiento a
                lo largo del proceso de ventas.
              </p>
              <Button icon={<Plus size={16} />} onClick={() => add(String(funnel.stages[0]?.id))}>
                Nueva oportunidad
              </Button>
            </div>
          )}
        </section>
      )}

      {selected && (
        <OpportunityDrawer
          opportunity={selected}
          funnel={funnel}
          onClose={() => setSelectedId(null)}
        />
      )}
    </main>
  );
};

export default FunnelBoard;
