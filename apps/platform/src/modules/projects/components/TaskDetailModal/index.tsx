import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Flag, Tag, Trash2, X } from 'lucide-react';
import type { Project, ProjectTask, ProjectTaskPriority, ProjectTaskStatus } from '@hlb/contracts';
import styles from './TaskDetailModal.module.css';

const dateValue = (value?: Date) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export default function TaskDetailModal({
  task,
  project,
  saving,
  onClose,
  onSave,
  onDelete,
}: {
  task?: ProjectTask;
  project: Project;
  saving: boolean;
  onClose: () => void;
  onSave: (patch: Partial<ProjectTask>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<Partial<ProjectTask>>({});
  useEffect(() => {
    if (task) setForm({
      name: task.name,
      description: task.description,
      listId: task.listId,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      estimatedMinutes: task.estimatedMinutes,
      tags: task.tags,
    });
  }, [task]);
  if (!task) return null;
  return (
    <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-label={`Editar ${task.name}`}>
        <header><div><small>{project.key} / {task.key}</small><h2>Detalle de la tarea</h2></div><button type="button" onClick={onClose}><X /></button></header>
        <form onSubmit={(event) => { event.preventDefault(); onSave(form); }}>
          <label className={styles.title}>Título<input value={form.name ?? ''} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Descripción<textarea rows={6} value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Añade contexto, requisitos o criterios de aceptación…" /></label>
          <div className={styles.grid}>
            <label><span><Flag />Prioridad</span><select value={form.priority ?? 'none'} onChange={(event) => setForm({ ...form, priority: event.target.value as ProjectTaskPriority })}><option value="none">Sin prioridad</option><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></label>
            <label><span><Tag />Lista</span><select value={String(form.listId ?? '')} onChange={(event) => setForm({ ...form, listId: event.target.value as ProjectTask['listId'] })}>{project.lists.map((list) => <option key={String(list.id)} value={String(list.id)}>{list.name}</option>)}</select></label>
            <label><span><CalendarDays />Fecha límite</span><input type="date" value={dateValue(form.dueDate)} onChange={(event) => setForm({ ...form, dueDate: event.target.value ? new Date(`${event.target.value}T12:00:00`) : undefined })} /></label>
            <label><span><Clock3 />Tiempo estimado</span><input type="number" min="0" value={form.estimatedMinutes ?? ''} onChange={(event) => setForm({ ...form, estimatedMinutes: event.target.value ? Number(event.target.value) : undefined })} placeholder="Minutos" /></label>
            <label><span>Estado</span><select value={form.status ?? 'open'} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectTaskStatus })}><option value="open">Abierta</option><option value="in_progress">En progreso</option><option value="blocked">Bloqueada</option><option value="completed">Completada</option><option value="cancelled">Cancelada</option></select></label>
            <label><span>Etiquetas</span><input value={(form.tags ?? []).join(', ')} onChange={(event) => setForm({ ...form, tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} placeholder="Diseño, urgente" /></label>
          </div>
          <footer><button className={styles.delete} type="button" onClick={onDelete}><Trash2 />Eliminar</button><div><button type="button" onClick={onClose}>Cancelar</button><button className={styles.save} type="submit" disabled={!form.name?.trim() || saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button></div></footer>
        </form>
      </section>
    </div>
  );
}
