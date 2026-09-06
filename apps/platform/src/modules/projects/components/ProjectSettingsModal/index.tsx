import { useEffect, useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import type { Project, ProjectList, ProjectListId } from '@hlb/contracts';
import styles from './ProjectSettingsModal.module.css';

type Props = {
  project?: Project;
  saving: boolean;
  deleting: boolean;
  onClose: () => void;
  onSave: (patch: Partial<Project>) => void;
  onDelete: () => void;
};

const newList = (position: number): ProjectList => ({
  id: crypto.randomUUID() as ProjectListId,
  name: 'Nueva lista',
  color: '#2E90FA',
  position,
  isCompleted: false,
});

export default function ProjectSettingsModal({ project, saving, deleting, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Project['visibility']>('organization');
  const [status, setStatus] = useState<Project['status']>('active');
  const [lists, setLists] = useState<ProjectList[]>([]);

  useEffect(() => {
    if (!project) return;
    setName(project.name);
    setDescription(project.description);
    setVisibility(project.visibility);
    setStatus(project.status);
    setLists(project.lists.map((item) => ({ ...item })));
  }, [project]);

  const updateList = (index: number, patch: Partial<ProjectList>) =>
    setLists((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));

  return (
    <Modal.Window isOpen={Boolean(project)} ariaLabel="Configuración del proyecto" closeOnEsc closeOnOverlay onClose={onClose} size={{ width: '72rem', maxWidth: 'calc(100vw - 3.2rem)' }}>
      <Modal.Header><div><h2>Configuración del proyecto</h2><p className={styles.subtitle}>{project?.key}</p></div><Modal.CloseButton onClick={onClose} /></Modal.Header>
      <Modal.Body className={styles.body}>
        <section className={styles.general}>
          <label>Nombre<TextInput value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe el objetivo del proyecto" /></label>
          <div className={styles.twoColumns}>
            <label>Estado<select value={status} onChange={(event) => setStatus(event.target.value as Project['status'])}><option value="planned">Planificado</option><option value="active">Activo</option><option value="paused">Pausado</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option></select></label>
            <label>Visibilidad<select value={visibility} onChange={(event) => setVisibility(event.target.value as Project['visibility'])}><option value="organization">Toda la organización</option><option value="private">Privado</option></select></label>
          </div>
        </section>
        <section className={styles.lists}>
          <div className={styles.sectionTitle}><div><h3>Columnas del tablero</h3><p>Personaliza las etapas por las que pasan las tareas.</p></div><Button variant="outline" theme="optional" icon={<Plus />} onClick={() => setLists((current) => [...current, newList(current.length)])}>Nueva columna</Button></div>
          <div className={styles.listRows}>{lists.map((item, index) => <div className={styles.listRow} key={String(item.id)}><GripVertical /><input type="color" value={item.color} onChange={(event) => updateList(index, { color: event.target.value })} aria-label={`Color de ${item.name}`} /><input value={item.name} onChange={(event) => updateList(index, { name: event.target.value })} aria-label="Nombre de columna" /><label className={styles.completed}><input type="checkbox" checked={item.isCompleted} onChange={(event) => updateList(index, { isCompleted: event.target.checked })} />Finaliza tareas</label><button type="button" aria-label="Eliminar columna" disabled={lists.length === 1} onClick={() => setLists((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /></button></div>)}</div>
        </section>
        <section className={styles.danger}><div><h3>Eliminar proyecto</h3><p>También se eliminarán sus tareas. Esta acción no se puede deshacer desde la interfaz.</p></div><Button className={styles.deleteButton} variant="outline" theme="optional" loading={deleting} onClick={onDelete}>Eliminar proyecto</Button></section>
      </Modal.Body>
      <Modal.Footer><Button variant="outline" theme="optional" onClick={onClose}>Cancelar</Button><Button loading={saving} disabled={!name.trim() || lists.some((item) => !item.name.trim())} onClick={() => onSave({ name: name.trim(), description: description.trim(), visibility, status, lists })}>Guardar cambios</Button></Modal.Footer>
    </Modal.Window>
  );
}
