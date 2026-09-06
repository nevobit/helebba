import { useMemo, useState } from 'react';
import { Bug, CheckSquare2, FileText, FolderOpen, LayoutDashboard, Link2, Map, MessageCircle, NotebookPen, Target } from 'lucide-react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import type { ProjectTemplate } from '@hlb/contracts';
import styles from './ProjectTemplateModal.module.css';

type TemplateDefinition = { id: ProjectTemplate; name: string; description: string; longDescription: string; icon: typeof Map; color: string; tint: string; similar: string[] };
const templates: TemplateDefinition[] = [
  { id: 'blank', name: 'Proyecto en blanco', description: 'Crea un proyecto desde cero', longDescription: 'Usa esta plantilla para diseñar un proyecto a tu medida desde el principio. Elige el formato que prefieras utilizar y crea tareas de forma rápida y sencilla para empezar a trabajar según tus necesidades.', icon: LayoutDashboard, color: '#98A2B3', tint: '#FFFFFF', similar: ['Brainstorming', 'Bug tracking'] },
  { id: 'roadmap', name: 'Roadmap', description: 'Planificación de producto a largo plazo', longDescription: 'Usa esta plantilla para plasmar el roadmap de tu producto y organizar en un periodo largo de tiempo todas las tareas principales a desarrollar. Obtén una visión global del avance gracias a las distintas vistas.', icon: Map, color: '#D41145', tint: '#E40846', similar: ['Sprints', 'Kanban board'] },
  { id: 'goals', name: 'Objetivos', description: 'Objetivos, KPIs y responsables', longDescription: 'Usa esta plantilla para establecer y dar seguimiento a los objetivos principales de tu empresa. Desglósalos en KPIs y diferentes tareas, asígnalos a los miembros de tu equipo y obtén una visión clara del progreso.', icon: Target, color: '#0BA5EC', tint: '#0BA5EC', similar: ['Estrategia de marketing', 'Plan de negocio', 'Roadmap'] },
  { id: 'bug_tracking', name: 'Bug tracking', description: 'Registro y resolución de incidencias', longDescription: 'Usa esta plantilla para archivar, organizar y distribuir los diferentes bugs de tu producto. Priorízalos asignándoles diferentes estados de resolución y fechas límite para optimizar el tiempo.', icon: Bug, color: '#D6A574', tint: '#D6A574', similar: ['Kanban board', 'Sprints', 'Roadmap'] },
  { id: 'kanban', name: 'Kanban board', description: 'Sistema visual para gestionar trabajo', longDescription: 'Usa esta plantilla para planificar tu trabajo. Asigna tareas a los miembros de tu equipo de manera visual y muy fácil de entender para optimizar el flujo de trabajo y mejorar la eficiencia del proyecto.', icon: CheckSquare2, color: '#C90050', tint: '#C90050', similar: ['Sprints', 'Bug tracking', 'Roadmap'] },
];
const features = [[LayoutDashboard, 'Resumen'], [NotebookPen, 'Notas'], [MessageCircle, 'Discusiones'], [FolderOpen, 'Archivos'], [FileText, 'Formularios'], [Link2, 'Enlaces']] as const;

function BoardPreview({ template }: { template: TemplateDefinition }) {
  const columns = template.id === 'roadmap' ? ['Q1', 'Q2', 'Q3', 'Q4'] : template.id === 'goals' ? ['Objetivo 1', 'En progreso', 'En riesgo', 'Alcanzado'] : ['Por hacer', 'En curso', 'En revisión', 'Completado'];
  return <div className={styles.boardPreview}><div className={styles.previewToolbar}><strong>{template.id === 'roadmap' ? 'Roadmap' : 'Tablero'}</strong><span /><span /><span /></div><div className={styles.previewColumns}>{columns.map((column, index) => <div key={column}><strong>{column}</strong>{[0, 1, ...(index === 0 ? [2] : [])].map((card) => <article key={card}><i style={{ background: [template.color, '#2E90FA', '#12B76A'][card] }} /><b /><b /><footer><small>{template.id.slice(0, 2).toUpperCase()}-{index + 1}0{card + 1}</small><em /></footer></article>)}</div>)}</div></div>;
}

export default function ProjectTemplateModal({ open, loading, onClose, onCreate }: { open: boolean; loading: boolean; onClose: () => void; onCreate: (data: { name: string; description: string; template: ProjectTemplate }) => void }) {
  const [selected, setSelected] = useState<ProjectTemplate>();
  const [step, setStep] = useState<'templates' | 'preview' | 'details'>('templates');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const current = useMemo(() => templates.find((template) => template.id === selected) ?? templates[0], [selected]);
  const CurrentIcon = current.icon;
  const close = () => { setStep('templates'); setSelected(undefined); setName(''); setDescription(''); onClose(); };
  const choose = (id: ProjectTemplate) => { setSelected(id); setStep('preview'); };
  return <Modal.Window isOpen={open} ariaLabel="Crear proyecto" className={styles.modal} closeOnEsc closeOnOverlay onClose={close} size={{ width: '128rem', maxWidth: 'calc(100vw - 3.2rem)' }}>
    {step === 'templates' && <><Modal.Header className={styles.pickerHeader}><h2>Empieza eligiendo una plantilla</h2><Modal.CloseButton onClick={close} /></Modal.Header><Modal.Body className={styles.pickerBody}>
      <div className={styles.featured}>{templates.map((template) => { const Icon = template.icon; return <button type="button" key={template.id} onClick={() => choose(template.id)}><span className={template.id === 'blank' ? styles.blankIcon : ''} style={template.id === 'blank' ? undefined : { background: template.tint }}><Icon /></span><strong>{template.name}</strong></button>; })}</div>
      <div className={styles.availableHeader}><h3>Plantillas disponibles</h3><button type="button">Tipo: Todos⌄</button></div><div className={styles.availableList}>{templates.slice().reverse().map((template) => { const Icon = template.icon; return <button type="button" key={template.id} onClick={() => choose(template.id)}><span style={{ background: `${template.color}1A`, color: template.color }}><Icon /></span><div><strong>{template.name}</strong><small>{template.description}</small></div></button>; })}</div>
    </Modal.Body></>}
    {step === 'preview' && <><Modal.Header className={styles.previewHeader}><div><span style={{ color: current.color }}><CurrentIcon /></span><h2>{current.name}</h2></div><Modal.CloseButton onClick={close} /></Modal.Header><Modal.Body className={styles.previewBody}>
      <aside><h3>Funciones</h3>{features.map(([Icon, label]) => <span key={label}><Icon />{label}</span>)}<h3 className={styles.similarTitle}>Plantillas similares</h3>{current.similar.map((label) => <button type="button" key={label} onClick={() => { const found = templates.find((item) => item.name === label); if (found) setSelected(found.id); }}><i style={{ color: current.color }}>◇</i>{label}</button>)}</aside>
      <section className={styles.previewContent}><p>{current.longDescription}</p><BoardPreview template={current} /><div className={styles.listPreview}><strong>Lista de tareas</strong><span /><span /></div></section>
    </Modal.Body><Modal.Footer className={styles.previewFooter}><Button variant="ghost" theme="optional" onClick={() => setStep('templates')}>Volver</Button><Button onClick={() => { setName(current.name === 'Proyecto en blanco' ? '' : current.name); setStep('details'); }}>Siguiente</Button></Modal.Footer></>}
    {step === 'details' && <><Modal.Header className={styles.detailsHeader}><div><span style={{ color: current.color }}><CurrentIcon /></span><div><h2>Crear proyecto</h2><p>{current.name}</p></div></div><Modal.CloseButton onClick={close} /></Modal.Header><Modal.Body className={styles.detailsBody}>
      <TextInput autoFocus label="Nombre del proyecto" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Lanzamiento nueva colección" /><label>Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="¿Qué quieres conseguir con este proyecto?" rows={4} /></label><label>Visibilidad<select defaultValue="organization"><option value="organization">Toda la organización</option></select></label>
    </Modal.Body><Modal.Footer className={styles.detailsFooter}><Button variant="outline" theme="optional" onClick={() => setStep('preview')}>Volver</Button><Button loading={loading} disabled={!name.trim()} onClick={() => onCreate({ name: name.trim(), description: description.trim(), template: current.id })}>Crear proyecto</Button></Modal.Footer></>}
  </Modal.Window>;
}
