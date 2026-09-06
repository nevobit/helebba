import { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, CloudDownload, FolderKanban, Grid2X2Plus, Info, MoreVertical, Plus, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@hlb/design-system';
import ProjectTemplateModal from '../../components/ProjectTemplateModal';
import { useProjectMutations, useProjects, useProjectTasks } from '../../hooks';
import styles from './MyTasks.module.css';

export default function MyTasks({ mode = 'my-tasks' }: { mode?: 'my-tasks' | 'projects' }) {
  const navigate = useNavigate();
  const { data: projects = [], isLoading, isError } = useProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks();
  const { create } = useProjectMutations();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const projectsMode = mode === 'projects';
  const filtered = projects.filter((project) => project.name.toLowerCase().includes(search.toLowerCase()));
  const projectById = new Map(projects.map((project) => [String(project.id), project]));
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>{!projectsMode && <button type="button" className={styles.backButton} aria-label="Volver" onClick={() => navigate('/projects')}><ArrowLeft /></button>}<h1>{projectsMode ? 'Proyectos' : 'Mis tareas'}</h1>{projectsMode && <Info />}</div>
        <nav><button type="button" aria-label="Aplicaciones"><Grid2X2Plus /></button>{!projectsMode && <button type="button" aria-label="Ayuda"><BookOpen /></button>}<button type="button" aria-label="Más opciones"><MoreVertical /></button><Button icon={<Plus />} onClick={() => setModalOpen(true)}>Nuevo proyecto</Button></nav>
      </header>
      {projectsMode && <div className={styles.toolbar}><div><button type="button">En progreso</button><button type="button" className={styles.filter}><Plus /> Filtro</button></div><div><label><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar proyectos" /></label><button type="button" aria-label="Descargar"><CloudDownload /></button></div></div>}
      {isLoading || (!projectsMode && tasksLoading) ? <div className={styles.state}>Cargando…</div> : isError ? <div className={styles.state}>No pudimos cargar la información.</div> : projects.length === 0 ? (
        <section className={`${styles.empty} ${projectsMode ? styles.projectsEmpty : styles.myTasksEmpty}`}>
          <div className={styles.illustration}><div className={styles.miniBoard}><header><span /><strong>Website</strong></header><section>{[0, 1, 2].map((column) => <div key={column}><i />{[0, 1].map((card) => <article key={card}><b /><b /><footer><small />{column === 1 && card === 1 ? <Plus /> : <em />}</footer></article>)}</div>)}</section></div></div>
          <div><h2>{projectsMode ? 'Proyectos' : 'Mis tareas'}</h2><p><CheckCircle2 /> Colabora en la gestión de tareas de forma eficiente.</p><p><CheckCircle2 /> Controla tiempo, presupuestos, rentabilidad y mucho más.</p><p><CheckCircle2 /> Adapta tus tareas con campos que se ajustan a tu necesidad.</p><Button onClick={() => setModalOpen(true)}>Crear proyecto</Button></div>
          <aside className={styles.helpBanner}><span><BookOpen /></span><strong>Crea proyectos, asigna tareas y organiza la carga de trabajo, entre otras cosas.</strong><Button variant="outline" theme="optional">Leer artículo</Button></aside>
        </section>
      ) : projectsMode ? (
        <section className={styles.grid}>
          {filtered.map((project) => <button type="button" key={String(project.id)} onClick={() => navigate(`/projects/${project.id}`)}><span className={styles.projectIcon}><FolderKanban /></span><div><strong>{project.name}</strong><small>{project.key} · {project.lists.length} listas</small><p>{project.description || 'Sin descripción'}</p></div><Users /></button>)}
        </section>
      ) : tasks.length === 0 ? (
        <section className={`${styles.empty} ${styles.myTasksEmpty}`}>
          <div className={styles.taskEmptyIcon}><FolderKanban /></div>
          <div><h2>Aún no tienes tareas</h2><p>Las tareas que tengas asignadas aparecerán en esta pantalla.</p><Button onClick={() => navigate('/projects')}>Ir a proyectos</Button></div>
        </section>
      ) : (
        <section className={styles.myTaskList}>
          {tasks.map((task) => <button type="button" key={String(task.id)} onClick={() => navigate(`/projects/${task.projectId}`)}><span className={styles.taskStatus} /><div><strong>{task.name}</strong><small>{task.key} · {projectById.get(String(task.projectId))?.name ?? 'Proyecto'}</small></div><span>{task.status === 'completed' ? 'Completada' : 'Activa'}</span></button>)}
        </section>
      )}
      <ProjectTemplateModal open={modalOpen} loading={create.isPending} onClose={() => setModalOpen(false)} onCreate={(payload) => create.mutate(payload, { onSuccess: (project) => { setModalOpen(false); navigate(`/projects/${project.id}`); } })} />
    </main>
  );
}
