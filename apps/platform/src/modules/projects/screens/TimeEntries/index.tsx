import { useMemo, useState } from 'react';
import { Clock3, Plus, Timer, Trash2, X } from 'lucide-react';
import { useProjectTimeEntries, useProjectTimeMutations, useProjects } from '../../hooks';
import styles from './TimeEntries.module.css';

export default function TimeEntries() {
  const { data: projects = [] } = useProjects();
  const { data: entries = [], isLoading } = useProjectTimeEntries();
  const { create, remove } = useProjectTimeMutations();
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState('1');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(false);
  const projectById = useMemo(() => new Map(projects.map((project) => [String(project.id), project.name])), [projects]);
  const totalMinutes = entries.reduce((total, entry) => total + entry.durationMinutes, 0);
  const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  const close = () => { setOpen(false); setDescription(''); setHours('1'); };
  return <main className={styles.page}>
    <header><div><h1>Registros horarios</h1><p>Registra el tiempo dedicado a tus proyectos y tareas.</p></div><button type="button" onClick={() => { setProjectId(String(projects[0]?.id ?? '')); setOpen(true); }} disabled={!projects.length}><Plus />Nuevo registro</button></header>
    <section className={styles.summary}><span><Timer /></span><div><small>Tiempo registrado</small><strong>{formatDuration(totalMinutes)}</strong></div><div><small>Registros</small><strong>{entries.length}</strong></div><div><small>Facturable</small><strong>{formatDuration(entries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.durationMinutes, 0))}</strong></div></section>
    <section className={styles.table}><div className={styles.head}><span>Fecha</span><span>Proyecto</span><span>Descripción</span><span>Duración</span><span>Facturable</span><span /></div>{isLoading ? <div className={styles.empty}>Cargando registros…</div> : entries.length === 0 ? <div className={styles.empty}><Clock3 /><strong>Todavía no hay registros horarios</strong><small>Añade el primer registro para medir el trabajo del equipo.</small></div> : entries.map((entry) => <div className={styles.row} key={String(entry.id)}><span>{new Date(entry.date).toLocaleDateString('es-CO')}</span><strong>{projectById.get(String(entry.projectId)) ?? 'Proyecto'}</strong><span>{entry.description || 'Sin descripción'}</span><strong>{formatDuration(entry.durationMinutes)}</strong><span>{entry.billable ? 'Sí' : 'No'}</span><button type="button" aria-label="Eliminar registro" onClick={() => remove.mutate(String(entry.id))}><Trash2 /></button></div>)}</section>
    {open && <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && close()}><section className={styles.modal}><header><h2>Nuevo registro horario</h2><button type="button" onClick={close}><X /></button></header><form onSubmit={(event) => { event.preventDefault(); if (!projectId || Number(hours) <= 0) return; create.mutate({ projectId, date: new Date(`${date}T12:00:00`), durationMinutes: Math.round(Number(hours) * 60), description, billable }, { onSuccess: close }); }}><label>Proyecto *<select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((project) => <option key={String(project.id)} value={String(project.id)}>{project.name}</option>)}</select></label><div><label>Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Horas<input type="number" min="0.25" step="0.25" value={hours} onChange={(event) => setHours(event.target.value)} /></label></div><label>Descripción<textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="¿En qué trabajaste?" /></label><label className={styles.check}><input type="checkbox" checked={billable} onChange={(event) => setBillable(event.target.checked)} />Tiempo facturable</label><footer><button type="button" onClick={close}>Cancelar</button><button type="submit" disabled={!projectId || create.isPending}>{create.isPending ? 'Guardando…' : 'Guardar registro'}</button></footer></form></section></div>}
  </main>;
}
