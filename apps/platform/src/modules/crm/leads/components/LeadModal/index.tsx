import { useState } from 'react';

const LeadModalContent = ({ funnel, initialStageId, lead, closeModal }: any) => {
  const defaultValues = {
    name: lead?.name || '',
    stageId: lead?.stageId || initialStageId || funnel?.stages?.[0]?.id || '',
    contactId: lead?.contactId || '',
    contactName: lead?.contactName || '',
    companyId: lead?.companyId || '',
    companyName: lead?.companyName || '',
    value: lead?.value || 0,
    currency: lead?.currency || 'COP',
    expectedCloseDate: lead?.expectedCloseDate ? new Date(lead.expectedCloseDate).toISOString().split('T')[0] : '',
    dueDate: lead?.dueDate ? new Date(lead.dueDate).toISOString().split('T')[0] : '',
    potential: lead?.potential || 50,
    notes: lead?.notes || '',
    assignedToName: lead?.assignedToName || '',
    assignedTo: lead?.assignedTo || '',
    tags: lead?.tags?.join(', ') || '',
    probability: lead?.probability || 0,
    relatedDocumentType: lead?.relatedDocumentType || '',
    relatedDocumentId: lead?.relatedDocumentId || '',
    customFields: lead?.customFields || [],
    stagnationDays: lead?.stagnationDays || 0,
  };

  const [formState, setFormState] = useState(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formState.name?.trim()) newErrors.name = 'Nombre es requerido';
    if (!formState.stageId) newErrors.stageId = 'Etapa es requerida';
    if (!formState.contactId) newErrors.contactId = 'Contacto es requerido';
    if (!formState.value || formState.value <= 0) newErrors.value = 'Valor debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    console.log('Submit', formState);
  };

  const stages = funnel?.stages?.sort((a: any, b: any) => a.order - b.order) || [];

  return (
    <div className="modal">
      <header className="header">
        <h2>{lead ? 'Editar oportunidad' : 'Nueva oportunidad'}</h2>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <div className="section">
          <h3>Información básica</h3>
          <div className="grid">
            <div className="field">
              <label htmlFor="name">Nombre de la oportunidad *</label>
              <input
                id="name"
                name="name"
                value={formState.name}
                onChange={(e) => handleChange(e)}
                placeholder="Nombre de la oportunidad"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="stageId">Etapa *</label>
              <select
                id="stageId"
                name="stageId"
                value={formState.stageId}
                onChange={(e) => handleChange(e)}
                required
              >
                <option value="">Seleccionar etapa</option>
                {stages.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="contactId">Contacto *</label>
              <input
                id="contactId"
                name="contactId"
                value={formState.contactId}
                onChange={(e) => handleChange(e)}
                placeholder="ID del contacto"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="contactName">Nombre del contacto</label>
              <input
                id="contactName"
                name="contactName"
                value={formState.contactName}
                onChange={(e) => handleChange(e)}
                placeholder="Nombre del contacto"
              />
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Empresa</h3>
          <div className="grid">
            <div className="field">
              <label htmlFor="companyId">ID Empresa</label>
              <input
                id="companyId"
                name="companyId"
                value={formState.companyId}
                onChange={(e) => handleChange(e)}
                placeholder="ID de la empresa"
              />
            </div>
            <div className="field">
              <label htmlFor="companyName">Nombre de la empresa</label>
              <input
                id="companyName"
                name="companyName"
                value={formState.companyName}
                onChange={(e) => handleChange(e)}
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Valores y fechas</h3>
          <div className="grid">
            <div className="field">
              <label htmlFor="value">Valor *</label>
              <input
                id="value"
                name="value"
                type="number"
                value={formState.value}
                onChange={(e) => handleChange(e)}
                placeholder="0"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="currency">Moneda</label>
              <select
                id="currency"
                name="currency"
                value={formState.currency}
                onChange={(e) => handleChange(e)}
              >
                <option value="COP">COP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="potential">Probabilidad (%)</label>
              <input
                id="potential"
                name="potential"
                type="number"
                value={formState.potential}
                onChange={(e) => handleChange(e)}
                placeholder="50"
                min="0"
                max="100"
              />
            </div>
            <div className="field">
              <label htmlFor="expectedCloseDate">Fecha esperada de cierre</label>
              <input
                id="expectedCloseDate"
                name="expectedCloseDate"
                type="date"
                value={formState.expectedCloseDate}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="field">
              <label htmlFor="dueDate">Fecha límite</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formState.dueDate}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="field">
              <label htmlFor="probability">Probabilidad calculada</label>
              <input
                id="probability"
                name="probability"
                type="number"
                value={formState.probability}
                onChange={(e) => handleChange(e)}
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Información adicional</h3>
          <div className="grid">
            <div className="field">
              <label htmlFor="assignedToName">Asignado a (nombre)</label>
              <input
                id="assignedToName"
                name="assignedToName"
                value={formState.assignedToName}
                onChange={(e) => handleChange(e)}
                placeholder="Nombre del responsable"
              />
            </div>
            <div className="field">
              <label htmlFor="assignedTo">ID Usuario asignado</label>
              <input
                id="assignedTo"
                name="assignedTo"
                value={formState.assignedTo}
                onChange={(e) => handleChange(e)}
                placeholder="ID del usuario"
              />
            </div>
            <div className="field">
              <label htmlFor="tags">Etiquetas (separadas por coma)</label>
              <input
                id="tags"
                name="tags"
                value={formState.tags}
                onChange={(e) => handleChange(e)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div className="field">
              <label htmlFor="relatedDocumentType">Tipo de documento</label>
              <select
                id="relatedDocumentType"
                name="relatedDocumentType"
                value={formState.relatedDocumentType}
                onChange={(e) => handleChange(e)}
              >
                <option value="">Ninguno</option>
                <option value="invoice">Factura</option>
                <option value="quote">Cotización</option>
                <option value="order">Pedido</option>
                <option value="proforma">Proforma</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="relatedDocumentId">ID Documento relacionado</label>
              <input
                id="relatedDocumentId"
                name="relatedDocumentId"
                value={formState.relatedDocumentId}
                onChange={(e) => handleChange(e)}
                placeholder="ID del documento"
              />
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Notas</h3>
          <textarea
            name="notes"
            value={formState.notes}
            onChange={(e) => handleChange(e)}
            placeholder="Notas adicionales..."
            rows={3}
          />
        </div>

        <div className="actions">
          <button type="button" className="buttonSecondary" onClick={handleClose}>
            Cancelar
          </button>
          <button type="submit" className="buttonPrimary">
            {lead ? 'Guardar cambios' : 'Crear oportunidad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export const LeadModal = ({ funnel, initialStageId, lead, closeModal }: any) => {
  return <LeadModalContent funnel={funnel} initialStageId={initialStageId} lead={lead} closeModal={closeModal} />;
};