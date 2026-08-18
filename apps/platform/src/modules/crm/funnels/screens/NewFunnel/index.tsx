import { useState } from 'react';
import { Button, TextInput } from '@hlb/design-system';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCrmMutations } from '../../hooks';
import styles from './NewFunnel.module.css';
type StageDraft = { name: string; color: string; probability: number };
const defaults: StageDraft[] = [
  { name: 'Nuevo', color: '#6172F3', probability: 10 },
  { name: 'Contactado', color: '#2E90FA', probability: 25 },
  { name: 'Propuesta', color: '#F79009', probability: 50 },
  { name: 'Negociación', color: '#9E77ED', probability: 75 },
  { name: 'Ganado', color: '#12B76A', probability: 100 },
];
const NewFunnel = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState(defaults);
  const [error, setError] = useState('');
  const { createFunnel, isCreatingFunnel } = useCrmMutations();
  const update = (index: number, patch: Partial<StageDraft>) =>
    setStages((current) =>
      current.map((stage, position) => (position === index ? { ...stage, ...patch } : stage)),
    );
  const save = async () => {
    if (!name.trim()) return setError('Ingresa el nombre del embudo.');
    if (stages.some((stage) => !stage.name.trim()))
      return setError('Todas las etapas deben tener un nombre.');
    try {
      const funnel = await createFunnel({
        name: name.trim(),
        description: description.trim(),
        stages: stages.map((stage, index) => ({ ...stage, order: index })) as never,
      });
      navigate(`/crm/funnels/${funnel.id}`);
    } catch (reason) {
      setError((reason as Error).message);
    }
  };
  return (
    <main className={styles.page}>
      <header>
        <Link to="/crm/funnels">← Volver</Link>
        <h1>Nuevo embudo</h1>
        <p>Define las etapas que seguirá tu proceso comercial.</p>
      </header>
      <section className={styles.form}>
        <TextInput
          label="Nombre del embudo *"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextInput
          label="Descripción"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className={styles.stageHeader}>
          <h2>Etapas</h2>
          <Button
            variant="outline"
            theme="optional"
            icon={<Plus size={16} />}
            onClick={() =>
              setStages((current) => [
                ...current,
                { name: 'Nueva etapa', color: '#667085', probability: 0 },
              ])
            }
          >
            Añadir etapa
          </Button>
        </div>
        <div className={styles.stages}>
          {stages.map((stage, index) => (
            <div className={styles.stage} key={index}>
              <GripVertical size={18} />
              <input
                aria-label="Color"
                type="color"
                value={stage.color}
                onChange={(event) => update(index, { color: event.target.value })}
              />
              <input
                aria-label="Nombre de etapa"
                value={stage.name}
                onChange={(event) => update(index, { name: event.target.value })}
              />
              <label>
                Probabilidad{' '}
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stage.probability}
                  onChange={(event) => update(index, { probability: Number(event.target.value) })}
                />
                %
              </label>
              <button
                disabled={stages.length === 1}
                onClick={() =>
                  setStages((current) => current.filter((_, position) => position !== index))
                }
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <footer>
          <Button variant="outline" theme="optional" onClick={() => navigate('/crm/funnels')}>
            Cancelar
          </Button>
          <Button loading={isCreatingFunnel} onClick={save}>
            Crear embudo
          </Button>
        </footer>
      </section>
    </main>
  );
};
export default NewFunnel;
