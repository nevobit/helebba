import { useState } from 'react';
import { ArrowLeft, CalendarDays, Plus, Settings } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ProjectTask } from '@hlb/contracts';
import TaskDetailModal from '../../components/TaskDetailModal';
import ProjectSettingsModal from '../../components/ProjectSettingsModal';
import { useProject, useProjectMutations, useProjectTasks } from '../../hooks';
import styles from './ProjectBoard.module.css';

export default function ProjectBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(projectId);
  const { data: tasks = [] } = useProjectTasks(projectId);
  const { update, remove, createTask, moveTask, removeTask } = useProjectMutations(projectId);
  const [draftList, setDraftList] = useState<string>();
  const [name, setName] = useState('');
  const [selectedTask, setSelectedTask] = useState<ProjectTask>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  if (isLoading) return <main className={styles.state}>Cargando proyecto…</main>;
  if (!project) return <main className={styles.state}>Proyecto no encontrado.</main>;
  return (
    <main className={styles.page}>
      <header><div><button type="button" onClick={() => navigate('/projects/tasks')}><ArrowLeft /></button><span className={styles.badge}>{project.key}</span><div><h1>{project.name}</h1><p>{project.description || 'Organiza las tareas de este proyecto.'}</p></div></div><nav><button type="button"><CalendarDays />Cronograma</button><button type="button" aria-label="Configurar proyecto" onClick={() => setSettingsOpen(true)}><Settings /></button></nav></header>
      <div className={styles.board}>
        {project.lists.sort((a, b) => a.position - b.position).map((list) => {
          const listTasks = tasks.filter((task) => String(task.listId) === String(list.id));
          return <section key={String(list.id)} className={styles.column} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const taskId = event.dataTransfer.getData('text/task-id'); if (taskId) moveTask.mutate({ taskId, patch: { listId: list.id, status: list.isCompleted ? 'completed' : 'in_progress', position: Date.now() } }); }}>
            <header><span style={{ background: list.color }} /><strong>{list.name}</strong><small>{listTasks.length}</small><button type="button" onClick={() => setDraftList(String(list.id))}><Plus /></button></header>
            <div className={styles.cards}>{listTasks.map((task) => <article key={String(task.id)} draggable onDragStart={(event) => event.dataTransfer.setData('text/task-id', String(task.id))} onClick={() => setSelectedTask(task)}><small>{task.key}</small><strong>{task.name}</strong>{task.dueDate && <span><CalendarDays />{new Date(task.dueDate).toLocaleDateString('es-CO')}</span>}</article>)}</div>
            {draftList === String(list.id) ? <form onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; createTask.mutate({ projectId: String(project.id), listId: list.id, name: name.trim() }, { onSuccess: () => { setName(''); setDraftList(undefined); } }); }}><textarea autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de la tarea" /><div><button type="button" onClick={() => setDraftList(undefined)}>Cancelar</button><button type="submit" disabled={!name.trim()}>Añadir</button></div></form> : <button className={styles.add} type="button" onClick={() => setDraftList(String(list.id))}><Plus />Añadir tarea</button>}
          </section>;
        })}
      </div>
      <TaskDetailModal
        task={selectedTask}
        project={project}
        saving={moveTask.isPending}
        onClose={() => setSelectedTask(undefined)}
        onSave={(patch) => selectedTask && moveTask.mutate(
          { taskId: String(selectedTask.id), patch },
          { onSuccess: () => setSelectedTask(undefined) },
        )}
        onDelete={() => selectedTask && removeTask.mutate(String(selectedTask.id), { onSuccess: () => setSelectedTask(undefined) })}
      />
      <ProjectSettingsModal
        project={settingsOpen ? project : undefined}
        saving={update.isPending}
        deleting={remove.isPending}
        onClose={() => setSettingsOpen(false)}
        onSave={(patch) => update.mutate({ projectId: String(project.id), patch }, { onSuccess: () => setSettingsOpen(false) })}
        onDelete={() => {
          if (!window.confirm(`¿Eliminar el proyecto “${project.name}” y todas sus tareas?`)) return;
          remove.mutate(String(project.id), { onSuccess: () => navigate('/projects/tasks') });
        }}
      />
    </main>
  );
}
