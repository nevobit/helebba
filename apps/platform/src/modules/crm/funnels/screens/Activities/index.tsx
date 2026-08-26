import { useMemo, useState } from 'react';
import { Button, useModal } from '@hlb/design-system';
import { CalendarDays, Download, Info, Plus, Search } from 'lucide-react';
import { ActivityModal } from '../../components/ActivityModal';
import { useCrmActivities } from '../../hooks';
import styles from './Activities.module.css';

const Activities = () => {
  const { data: activities = [], isLoading } = useCrmActivities();
  const { openModal, closeModal } = useModal();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const visible = useMemo(
    () =>
      activities.filter((activity) => {
        if (status === 'pending' && activity.completed) return false;
        if (status === 'completed' && !activity.completed) return false;
        return activity.title.toLowerCase().includes(search.trim().toLowerCase());
      }),
    [activities, search, status],
  );
  const openCreate = () =>
    openModal(<ActivityModal closeModal={closeModal} />, { id: 'new-crm-activity' });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>
          Actividades <Info size={16} />
        </h1>
        <div className={styles.actions}>
          <Button theme="optional" variant="outline">
            <CalendarDays size={16} /> Calendario
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} /> Nueva actividad
          </Button>
        </div>
      </header>
      <section className={styles.card}>
        <div className={styles.toolbar}>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>
          <button type="button" className={styles.filter}>
            <Plus size={15} /> Filtro
          </button>
          <label className={styles.search}>
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar actividades"
            />
          </label>
          <button type="button" className={styles.iconButton} aria-label="Exportar">
            <Download size={17} />
          </button>
        </div>
        {visible.length === 0 && !isLoading ? (
          <div className={styles.empty}>
            <div className={styles.emptyArt}>
              <CalendarDays size={42} />
            </div>
            <h2>Actividades</h2>
            <p>
              Crea actividades para llevar un seguimiento de los eventos
              <br />
              relacionados con tus oportunidades actuales.
            </p>
            <Button onClick={openCreate}>Nueva actividad</Button>
          </div>
        ) : (
          <div className={styles.list}>
            {visible.map((activity) => (
              <article key={String(activity.id)} className={styles.activity}>
                <span className={styles.activityIcon}>
                  <CalendarDays size={18} />
                </span>
                <div>
                  <strong>{activity.title}</strong>
                  <span>{activity.opportunityName || 'Sin oportunidad vinculada'}</span>
                </div>
                <time>
                  {new Date(activity.startsAt).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
                <span className={activity.completed ? styles.done : styles.pending}>
                  {activity.completed ? 'Completada' : 'Pendiente'}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
export default Activities;
