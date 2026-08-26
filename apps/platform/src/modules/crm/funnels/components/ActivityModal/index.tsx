import { useMemo, useState } from 'react';
import { Button, Modal } from '@hlb/design-system';
import type { CrmOpportunityActivityType } from '@hlb/contracts';
import {
  Bell,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ContactRound,
  Martini,
  Pencil,
  Plane,
  Phone,
  Plus,
  UserPlus,
  Users,
  Utensils,
} from 'lucide-react';
import { useOrganizationUsers } from '@/modules/settings/users/hooks';
import { useCrmPreferences } from '@/modules/settings/crm/hooks';
import { useCrmActivityOpportunities, useCrmMutations } from '../../hooks';
import styles from './ActivityModal.module.css';

type Props = { dealId?: string; closeModal: () => void };
const activityIcons = {
  phone: Phone,
  calendar: CalendarDays,
  plane: Plane,
  utensils: Utensils,
  martini: Martini,
};
const pad = (value: number) => String(value).padStart(2, '0');
const inputDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const inputTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const ActivityModal = ({ dealId, closeModal }: Props) => {
  const now = useMemo(() => {
    const date = new Date();
    date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
    return date;
  }, []);
  const end = useMemo(() => new Date(now.getTime() + 60 * 60 * 1000), [now]);
  const { users } = useOrganizationUsers();
  const { data: preferences } = useCrmPreferences();
  const types = preferences?.activityTypes ?? [];
  const { data: opportunities = [] } = useCrmActivityOpportunities();
  const { addOpportunityActivity, isAddingOpportunityActivity } = useCrmMutations();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CrmOpportunityActivityType>('call');
  const [date, setDate] = useState(inputDate(now));
  const [startTime, setStartTime] = useState(inputTime(now));
  const [endTime, setEndTime] = useState(inputTime(end));
  const [allDay, setAllDay] = useState(false);
  const [emailReminder, setEmailReminder] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [opportunityId, setOpportunityId] = useState(dealId ?? '');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const activeType = types.some((item) => item.id === type) ? type : (types[0]?.id ?? type);
  const selectedUser = users.find((user) => String(user.userId) === assignedTo);
  const assigneeInitials = (selectedUser?.name || 'Sin asignar')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const moveDate = (days: number) => {
    const next = new Date(`${date}T12:00`);
    next.setDate(next.getDate() + days);
    setDate(inputDate(next));
  };

  const save = async () => {
    setError('');
    try {
      await addOpportunityActivity({
        payload: {
          title,
          type: activeType,
          startsAt: new Date(`${date}T${allDay ? '00:00' : startTime}`),
          endsAt: new Date(`${date}T${allDay ? '23:59' : endTime}`),
          allDay,
          emailReminder,
          assignedTo: assignedTo ? (assignedTo as never) : undefined,
          assignedToName: selectedUser?.name,
          invitees: [],
          notes,
          completed,
          opportunityId: opportunityId ? (opportunityId as never) : undefined,
        },
      });
      closeModal();
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel="Nueva actividad"
      className={styles.modal}
      size={{ width: '82rem', maxWidth: 'calc(100vw - 3.2rem)' }}
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
    >
      <Modal.Body className={styles.body}>
        <aside className={styles.dayPanel}>
          <div className={styles.dayHeader}>
            <div>
              <span className={styles.weekday}>
                {now.toLocaleDateString('es-ES', { weekday: 'long' })}
              </span>
              <strong>
                {new Date(`${date}T12:00`).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
            </div>
            <div className={styles.dayNavigation}>
              <button type="button" aria-label="Día anterior" onClick={() => moveDate(-1)}>
                <ChevronLeft size={17} />
              </button>
              <button type="button" aria-label="Día siguiente" onClick={() => moveDate(1)}>
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
          <div className={styles.schedule}>
            {Array.from({ length: 12 }, (_, index) => index + 11).map((hour) => (
              <span key={hour}>{hour}</span>
            ))}
            <div
              className={styles.eventPreview}
              style={{ top: `${Math.max(0, (Number(startTime.slice(0, 2)) - 11) * 4.65)}rem` }}
            >
              {allDay ? 'Todo el día' : `${startTime} - ${endTime}`}
            </div>
          </div>
        </aside>

        <section className={styles.form}>
          <div className={styles.formHead}>
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Título de la nueva actividad"
            />
            <Modal.CloseButton onClick={closeModal} />
          </div>
          <div className={styles.types}>
            {types.map((item) => {
              const Icon = activityIcons[item.icon as keyof typeof activityIcons] ?? CalendarDays;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={activeType === item.id ? styles.typeActive : styles.type}
                  onClick={() => setType(item.id)}
                >
                  <Icon size={21} />
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className={styles.dateCard}>
            <label className={styles.toggleRow}>
              <CalendarDays size={17} />
              <span>Día entero</span>
              <input
                type="checkbox"
                checked={allDay}
                onChange={(event) => setAllDay(event.target.checked)}
              />
            </label>
            <label className={styles.dateRow}>
              <Clock3 size={17} />
              <span>Inicio</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              {!allDay && (
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                />
              )}
            </label>
            {!allDay && (
              <label className={styles.dateRow}>
                <Clock3 size={17} />
                <span>Final</span>
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                />
              </label>
            )}
          </div>

          <label className={styles.optionRow}>
            <Bell size={17} />
            <span>Programar alerta vía email</span>
            <input
              type="checkbox"
              checked={emailReminder}
              onChange={(event) => setEmailReminder(event.target.checked)}
            />
          </label>
          <label className={styles.assigneeRow}>
            <Users size={17} />
            <span>Asignado a</span>
            <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>
              <option value="">Sin asignar</option>
              {users.map((user) => (
                <option key={String(user.userId)} value={String(user.userId)}>
                  {user.name}
                </option>
              ))}
            </select>
            <span className={styles.assigneeAvatar}>{assigneeInitials}</span>
            <span className={styles.addCircle}>
              <Plus size={13} />
            </span>
          </label>
          <button type="button" className={styles.actionRow}>
            <UserPlus size={17} />
            <span>Invitar personas</span>
          </button>
          <button type="button" className={styles.actionRow}>
            <ContactRound size={17} />
            <span>Enlazar contacto</span>
          </button>
          {!dealId && (
            <label className={styles.selectRow}>
              <CalendarCheck size={17} />
              <span>Vincular oportunidad</span>
              <select
                value={opportunityId}
                onChange={(event) => setOpportunityId(event.target.value)}
              >
                <option value="">Sin oportunidad</option>
                {opportunities.map((item) => (
                  <option key={String(item.id)} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            className={styles.actionRow}
            onClick={() => setShowNotes((value) => !value)}
          >
            <Pencil size={17} />
            <span>Añadir notas</span>
          </button>
          {showNotes && (
            <textarea
              className={styles.notesInput}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Escribe una nota sobre la actividad"
              rows={2}
              autoFocus
            />
          )}
          {error && <p className={styles.error}>{error}</p>}
          <footer className={styles.footer}>
            <label>
              <CheckCircle2 size={16} />
              <input
                type="checkbox"
                checked={completed}
                onChange={(event) => setCompleted(event.target.checked)}
              />
              Completada
            </label>
            <Button loading={isAddingOpportunityActivity} onClick={() => void save()}>
              Crear
            </Button>
          </footer>
        </section>
      </Modal.Body>
    </Modal.Window>
  );
};
