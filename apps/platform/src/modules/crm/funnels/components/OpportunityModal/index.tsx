import { useMemo, useState } from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import { Info } from 'lucide-react';
import type { CrmFunnel, CrmOpportunity } from '@hlb/contracts';
import { useContacts } from '@/modules/contacts/hooks';
import { useOrganizationUsers } from '@/modules/settings/users/hooks';
import { useCrmMutations } from '../../hooks';
import styles from './OpportunityModal.module.css';

interface OpportunityModalProps {
  funnel: CrmFunnel;
  initialStageId: string;
  opportunity?: CrmOpportunity;
  closeModal: () => void;
}

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

const toDateInput = (value?: Date) =>
  value ? new Date(value).toISOString().slice(0, 10) : '';

export const OpportunityModal = ({
  funnel,
  initialStageId,
  opportunity,
  closeModal,
}: OpportunityModalProps) => {
  const editing = Boolean(opportunity);
  const { contacts: companies } = useContacts({ page: 1, limit: 100, scope: 'companies' });
  const { contacts: people } = useContacts({ page: 1, limit: 100, scope: 'people' });
  const { users: organizationUsers } = useOrganizationUsers();
  const [companyId, setCompanyId] = useState(
    opportunity?.companyId ? String(opportunity.companyId) : '',
  );
  const [contactId, setContactId] = useState(
    opportunity?.contactId ? String(opportunity.contactId) : '',
  );
  const [name, setName] = useState(opportunity?.name ?? '');
  const [value, setValue] = useState(String(opportunity?.value ?? '0'));
  const [currency, setCurrency] = useState(opportunity?.currency ?? 'COP');
  const [stageId, setStageId] = useState(
    opportunity ? String(opportunity.stageId) : initialStageId,
  );
  const [tags, setTags] = useState((opportunity?.tags ?? []).join(', '));
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    toDateInput(opportunity?.expectedCloseDate),
  );
  const [probability, setProbability] = useState(
    opportunity?.probability != null ? String(opportunity.probability) : '',
  );
  const [assignedToName, setAssignedToName] = useState(opportunity?.assignedToName ?? '');
  const [relatedDocumentType, setRelatedDocumentType] = useState(
    opportunity?.relatedDocumentType ?? 'estimate',
  );
  const [relatedDocumentId, setRelatedDocumentId] = useState(
    opportunity?.relatedDocumentId ?? '',
  );
  const [error, setError] = useState('');
  const { createOpportunity, isCreatingOpportunity, updateOpportunity, isUpdatingOpportunity } =
    useCrmMutations();

  const selectedCompany = companies.find((item) => String(item.id) === companyId);
  const selectedPerson = people.find((item) => String(item.id) === contactId);
  const activeUsers = useMemo(
    () => organizationUsers.filter((user) => user.status === 'active'),
    [organizationUsers],
  );

  const buildPayload = () => ({
    name: name.trim(),
    companyId: (companyId || undefined) as never,
    companyName: selectedCompany?.name ?? '',
    contactId: (contactId || undefined) as never,
    contactName: selectedPerson?.name ?? '',
    value: Number(value),
    currency,
    stageId: stageId as never,
    expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
    assignedToName: assignedToName.trim(),
    tags: tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    probability: probability ? Number(probability) : undefined,
    relatedDocumentType,
    relatedDocumentId,
  });

  const save = () => {
    if (!name.trim()) return setError('Ingresa el título de la oportunidad.');
    if (editing && opportunity) {
      updateOpportunity(
        { dealId: String(opportunity.id), payload: buildPayload() },
        { onSuccess: closeModal, onError: (reason: Error) => setError(reason.message) },
      );
      return;
    }
    createOpportunity(
      {
        funnelId: String(funnel.id),
        payload: {
          ...buildPayload(),
          notes: '',
          status: 'open',
        },
      },
      { onSuccess: closeModal, onError: (reason: Error) => setError(reason.message) },
    );
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel={`${editing ? 'Editar' : 'Nueva'} oportunidad - ${funnel.name}`}
      className={styles.modal}
      size={{ width: '68rem', maxWidth: 'calc(100vw - 3.2rem)' }}
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
    >
      <Modal.Header>
        <h2 className={styles.title}>
          {editing ? 'Editar' : 'Nueva'} oportunidad - {funnel.name}
        </h2>
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <label className={styles.field}>
          <span className={styles.label}>Empresa</span>
          <select
            className={styles.control}
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
          >
            <option value="">Seleccionar compañía</option>
            {companies.map((item) => (
              <option key={String(item.id)} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Persona de contacto</span>
          <select
            className={styles.control}
            value={contactId}
            onChange={(event) => setContactId(event.target.value)}
          >
            <option value="">Selecciona persona de contacto</option>
            {people
              .filter((item) => !companyId || String(item.companyId) === companyId)
              .map((item) => (
                <option key={String(item.id)} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
          </select>
        </label>

        <TextInput
          label="Título de la oportunidad"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <div className={styles.row}>
          <TextInput
            label="Valor de la oportunidad"
            type="number"
            min="0"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <label className={styles.field}>
            <span className={styles.label}>Moneda</span>
            <select
              className={styles.control}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="COP">Peso colombiano (COP)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </label>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Etapa del embudo</span>
          <div className={styles.stagePicker} role="radiogroup" aria-label="Etapa del embudo">
            {funnel.stages.map((stage, index) => (
              <button
                type="button"
                role="radio"
                aria-checked={String(stage.id) === stageId}
                key={String(stage.id)}
                className={cx(
                  styles.stageOption,
                  String(stage.id) === stageId && styles.stageOptionActive,
                  index === 0 && styles.stageOptionFirst,
                )}
                onClick={() => setStageId(String(stage.id))}
              >
                {stage.name}
              </button>
            ))}
          </div>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Asignado a</span>
          <select
            className={styles.control}
            value={assignedToName}
            onChange={(event) => setAssignedToName(event.target.value)}
          >
            <option value="">Sin asignar</option>
            {activeUsers.map((user) => (
              <option key={String(user.userId)} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </label>

        <TextInput
          label="Tags"
          placeholder="Crea la primera etiqueta"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>Fecha de cierre prevista</span>
            <input
              className={styles.control}
              type="date"
              value={expectedCloseDate}
              onChange={(event) => setExpectedCloseDate(event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>
              Probabilidad de la oportunidad
              <Info size={14} className={styles.labelIcon} />
            </span>
            <select
              className={styles.control}
              value={probability}
              onChange={(event) => setProbability(event.target.value)}
            >
              <option value="">Heredar probabilidad de la etapa</option>
              {[10, 25, 50, 75, 100].map((item) => (
                <option key={item} value={item}>
                  {item}%
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Relacionar documento</span>
          <div className={styles.document}>
            <select
              className={styles.control}
              value={relatedDocumentType}
              onChange={(event) => setRelatedDocumentType(event.target.value)}
            >
              <option value="estimate">Presupuesto</option>
              <option value="invoice">Factura</option>
            </select>
            <input
              className={styles.control}
              placeholder="Buscar"
              value={relatedDocumentId}
              onChange={(event) => setRelatedDocumentId(event.target.value)}
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <Button loading={isCreatingOpportunity || isUpdatingOpportunity} onClick={save}>
          Guardar oportunidad
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};
