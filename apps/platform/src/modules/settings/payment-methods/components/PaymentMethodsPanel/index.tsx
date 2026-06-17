import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, Menus, Modal, TextInput } from '@hlb/design-system';
import { CalendarDays, ChevronRight, ExternalLink, Landmark, Plus, X } from 'lucide-react';
import type {
  FinancialFeeType,
  PaymentDisbursementRule,
  PaymentMethod,
  PaymentMethodType,
  PaymentSettlementMode,
} from '@hlb/contracts';
import { useSession } from '@/shared';
import { useCreatePaymentMethod, usePaymentMethods, useUpdatePaymentMethod } from '../../hooks';
import styles from './PaymentMethodsPanel.module.css';

type PaymentMethodsPanelProps = {
  onClose: () => void;
};

type PaymentMethodFormState = {
  id: string;
  name: string;
  type: PaymentMethodType;
  status: string;
  isDefault: boolean;
  bankingAccountId: string;
  connectionId: string;
  documentText: string;
  dueDays: string;
  settlementMode: PaymentSettlementMode;
  disbursementRule: PaymentDisbursementRule;
  disbursementDays: string;
  disbursementDayOfMonth: string;
  supportsInstallments: boolean;
  minInstallments: string;
  maxInstallments: string;
  requiresApprovalReference: boolean;
  requiresDeliveryConfirmation: boolean;
  financialFeeType: FinancialFeeType;
  financialFeeValue: string;
};

const initialFormState: PaymentMethodFormState = {
  id: '',
  name: '',
  type: 'bank_transfer',
  status: 'active',
  isDefault: false,
  bankingAccountId: '',
  connectionId: '',
  documentText: '',
  dueDays: '',
  settlementMode: 'deferred',
  disbursementRule: 'days_after_issue',
  disbursementDays: '',
  disbursementDayOfMonth: '',
  supportsInstallments: false,
  minInstallments: '',
  maxInstallments: '',
  requiresApprovalReference: false,
  requiresDeliveryConfirmation: false,
  financialFeeType: 'none',
  financialFeeValue: '',
};

const getDocumentText = (paymentMethod: PaymentMethod) => {
  const metadata = paymentMethod.metadata as { documentText?: unknown } | undefined;
  return typeof metadata?.documentText === 'string' ? metadata.documentText : '';
};

const providerRows = [
  { label: 'Helebba Wallet', action: 'Descubre más', className: '' },
  { label: 'stripe', action: 'Conectar', className: styles.providerStripe },
  { label: 'PayPal', action: 'Conectar', className: styles.providerPaypal },
  { label: 'Square', action: 'Conectar', className: styles.providerSquare },
];

export const PaymentMethodsPanel = ({ onClose }: PaymentMethodsPanelProps) => {
  const organization = useSession((state) => state.organization);
  const { paymentMethods } = usePaymentMethods({ page: 1, limit: 100 });
  const { createPaymentMethod, isCreatingPaymentMethod } = useCreatePaymentMethod();
  const { updatePaymentMethod, isUpdatingPaymentMethod } = useUpdatePaymentMethod();
  const [formState, setFormState] = useState<PaymentMethodFormState>(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCreateModal = () => {
    setFormState(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (paymentMethod: PaymentMethod) => {
    setFormState({
      id: String(paymentMethod.id),
      name: paymentMethod.name,
      type: paymentMethod.type ?? 'bank_transfer',
      status: paymentMethod.status ?? 'active',
      isDefault: Boolean(paymentMethod.isDefault),
      bankingAccountId: paymentMethod.bankingAccountId ?? '',
      connectionId: paymentMethod.connectionId ?? '',
      documentText: getDocumentText(paymentMethod),
      dueDays: String(paymentMethod.dueDays ?? 0),
      settlementMode: paymentMethod.settlementMode ?? 'deferred',
      disbursementRule: paymentMethod.disbursementRule ?? (paymentMethod.settlementMode === 'instant' ? 'immediate' : 'days_after_issue'),
      disbursementDays: paymentMethod.disbursementDays ? String(paymentMethod.disbursementDays) : '',
      disbursementDayOfMonth: paymentMethod.disbursementDayOfMonth ? String(paymentMethod.disbursementDayOfMonth) : '',
      supportsInstallments: Boolean(paymentMethod.supportsInstallments),
      minInstallments: paymentMethod.minInstallments ? String(paymentMethod.minInstallments) : '',
      maxInstallments: paymentMethod.maxInstallments ? String(paymentMethod.maxInstallments) : '',
      requiresApprovalReference: Boolean(paymentMethod.requiresApprovalReference),
      requiresDeliveryConfirmation: Boolean(paymentMethod.requiresDeliveryConfirmation),
      financialFeeType: paymentMethod.financialFeeType ?? 'none',
      financialFeeValue: paymentMethod.financialFeeValue ? String(paymentMethod.financialFeeValue) : '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormState(initialFormState);
  };

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, type, value } = event.target;
    const nextValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;
    setFormState((current) => {
      if (name === 'settlementMode' && value === 'instant') {
        return { ...current, settlementMode: 'instant', disbursementRule: 'immediate' };
      }

      if (name === 'disbursementRule' && value === 'immediate') {
        return { ...current, disbursementRule: 'immediate', settlementMode: 'instant' };
      }

      if (name === 'financialFeeType' && (value === 'none' || value === 'custom')) {
        return { ...current, financialFeeType: value as FinancialFeeType, financialFeeValue: '' };
      }

      return { ...current, [name]: nextValue };
    });
  };

  const saveDefault = (paymentMethod: PaymentMethod) => {
    updatePaymentMethod({
      id: String(paymentMethod.id),
      payload: { isDefault: true },
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: formState.name.trim(),
      type: formState.type,
      status: formState.status,
      isDefault: formState.isDefault,
      bankingAccountId: formState.bankingAccountId.trim(),
      connectionId: formState.connectionId.trim(),
      dueDays: Number(formState.dueDays || 0),
      settlementMode: formState.settlementMode,
      disbursementRule: formState.disbursementRule,
      disbursementDays:
        formState.disbursementRule === 'days_after_issue' && formState.disbursementDays
          ? Number(formState.disbursementDays)
          : undefined,
      disbursementDayOfMonth:
        formState.disbursementRule === 'day_of_month' && formState.disbursementDayOfMonth
          ? Number(formState.disbursementDayOfMonth)
          : undefined,
      supportsInstallments: formState.supportsInstallments,
      minInstallments:
        formState.supportsInstallments && formState.minInstallments
          ? Number(formState.minInstallments)
          : undefined,
      maxInstallments:
        formState.supportsInstallments && formState.maxInstallments
          ? Number(formState.maxInstallments)
          : undefined,
      requiresApprovalReference: formState.requiresApprovalReference,
      requiresDeliveryConfirmation: formState.requiresDeliveryConfirmation,
      financialFeeType: formState.financialFeeType,
      financialFeeValue:
        formState.financialFeeType !== 'none' && formState.financialFeeType !== 'custom' && formState.financialFeeValue
          ? Number(formState.financialFeeValue)
          : undefined,
      metadata: {
        documentText: formState.documentText.trim(),
      },
    };

    if (!payload.name) return;

    if (formState.id) {
      updatePaymentMethod(
        {
          id: formState.id,
          payload,
        },
        { onSuccess: closeModal },
      );
      return;
    }

    createPaymentMethod(payload, { onSuccess: closeModal });
  };

  return (
    <div className={styles.overlay} role="presentation">
      <aside className={styles.panel} aria-label="Formas de pago">
        <div className={styles.shell}>
          <header className={styles.header}>
            <h2>{organization?.legalName || organization?.name || 'Configuración'}</h2>
            <button
              className={styles.closeButton}
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </header>

          <div className={styles.content}>
            <nav className={styles.breadcrumb} aria-label="Ruta de configuración">
              <span>Configuración</span>
              <ChevronRight size={16} />
              <strong>Formas de pago</strong>
            </nav>

            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Formas de pago</h3>
                  <p>
                    Añade cuentas de banco o efectivo, o bien conecta tu proveedor online para
                    gestionar los pagos de tus facturas en Helebba.
                  </p>
                </div>
                <Button
                  theme="optional"
                  variant="outline"
                  size="medium"
                  icon={<Plus size={17} />}
                  onClick={openCreateModal}
                >
                  Añadir método de pago
                </Button>
              </div>

              {paymentMethods.map((paymentMethod) => (
                <article className={styles.methodRow} key={String(paymentMethod.id)}>
                  <span className={styles.methodIcon}>
                    <Landmark size={18} />
                  </span>
                  <div className={styles.methodText}>
                    <strong>{paymentMethod.name}</strong>
                    <p>{getDocumentText(paymentMethod) || paymentMethod.name}</p>
                    <span className={styles.dueBadge}>
                      <CalendarDays size={13} /> {paymentMethod.dueDays ?? 0} Días de vencimiento
                    </span>
                  </div>
                  <Menus defaultPlacement="bottom-end">
                    <Menus.Menu>
                      <Menus.Toggle
                        id={`payment-method-${paymentMethod.id}`}
                        className={styles.menuButton}
                        verticalIcon
                        aria-label={`Opciones de ${paymentMethod.name}`}
                      />
                      <Menus.List id={`payment-method-${paymentMethod.id}`} placement="bottom-end">
                        <Menus.Item
                          id={`edit-${paymentMethod.id}`}
                          onClick={() => openEditModal(paymentMethod)}
                        >
                          Editar
                        </Menus.Item>
                        <Menus.Item
                          id={`default-${paymentMethod.id}`}
                          onClick={() => saveDefault(paymentMethod)}
                        >
                          Establecer como método predeterminado
                        </Menus.Item>
                      </Menus.List>
                    </Menus.Menu>
                  </Menus>
                </article>
              ))}
            </section>

            <section className={styles.card}>
              <div className={styles.onlineHeader}>
                <h3>Métodos de pago online</h3>
                <p>
                  Conecta tu proveedor online para que tus clientes puedan efectuar el pago de las
                  facturas que crees en Helebba.
                </p>
              </div>
              {providerRows.map((provider) => (
                <div className={styles.onlineRow} key={provider.label}>
                  <span className={`${styles.providerLogo} ${provider.className}`}>
                    {provider.label}
                  </span>
                  <span />
                  <Button
                    theme="optional"
                    variant="outline"
                    size="medium"
                    icon={<ExternalLink size={16} />}
                  >
                    {provider.action}
                  </Button>
                </div>
              ))}
            </section>
          </div>
        </div>
      </aside>

      {isModalOpen && (
        <Modal.Window
          isOpen
          ariaLabel="Añadir método de pago manual"
          className={styles.modal}
          closeOnEsc
          closeOnOverlay
          onClose={closeModal}
          size={{ width: '60rem', maxWidth: 'calc(100vw - 3.2rem)' }}
        >
          <Modal.Header className={styles.modalHeader}>
            <h2>
              {formState.id ? 'Editar método de pago manual' : 'Añadir método de pago manual'}
            </h2>
            <Modal.CloseButton onClick={closeModal} label="Cerrar" />
          </Modal.Header>

          <form className={styles.modalForm} onSubmit={handleSubmit}>
            <Modal.Body className={styles.modalBody}>
              <TextInput
                label="Nombre interno"
                name="name"
                value={formState.name}
                placeholder="Nombre interno"
                fullWidth
                autoFocus
                onChange={updateField}
              />

              <div className={styles.formGrid}>
                <label className={styles.selectField}>
                  Tipo de método
                  <select name="type" value={formState.type} onChange={updateField}>
                    <option value="bank_transfer">Transferencia bancaria</option>
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="credit_provider">Crédito proveedor</option>
                    <option value="cash_on_delivery">Contra entrega</option>
                    <option value="other">Otro</option>
                  </select>
                </label>

                <label className={styles.selectField}>
                  Estado
                  <select name="status" value={formState.status} onChange={updateField}>
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </label>
              </div>

              <label className={styles.textareaField}>
                Texto que se muestra en el documento
                <div className={styles.textareaBox}>
                  <textarea
                    name="documentText"
                    placeholder="Ejemplo: Pagar por transferencia a..."
                    value={formState.documentText}
                    onChange={updateField}
                  />
                  <div className={styles.editorToolbar} aria-hidden="true">
                    <button type="button">B</button>
                    <button type="button">I</button>
                    <button type="button">U</button>
                    <button type="button">S</button>
                    <button type="button">13</button>
                    <button type="button">•</button>
                    <button type="button">1.</button>
                  </div>
                </div>
              </label>

              <label className={styles.selectField}>
                Banco
                <button className={styles.bankLink} type="button">
                  Añade / conecta tu primer banco
                </button>
              </label>

              <div className={styles.formGrid}>
                <TextInput
                  label="Cuenta bancaria"
                  name="bankingAccountId"
                  value={formState.bankingAccountId}
                  placeholder="ID de cuenta o banco asociado"
                  fullWidth
                  onChange={updateField}
                />

                <TextInput
                  label="Conexión externa"
                  name="connectionId"
                  value={formState.connectionId}
                  placeholder="ID de pasarela o conexión"
                  fullWidth
                  onChange={updateField}
                />
              </div>

              <div className={styles.formGrid}>
                <label className={styles.selectField}>
                  Vencimiento
                  <select name="dueDays" value={formState.dueDays} onChange={updateField}>
                    <option value="">Sin seleccionar</option>
                    <option value="0">0 días de vencimiento</option>
                    <option value="7">7 días de vencimiento</option>
                    <option value="15">15 días de vencimiento</option>
                    <option value="30">30 días de vencimiento</option>
                    <option value="60">60 días de vencimiento</option>
                  </select>
                </label>

                <label className={styles.selectField}>
                  Liquidación
                  <select
                    name="settlementMode"
                    value={formState.settlementMode}
                    onChange={updateField}
                  >
                    <option value="instant">Inmediata</option>
                    <option value="deferred">Diferida</option>
                    <option value="installments">En cuotas</option>
                    <option value="on_delivery">Contra entrega</option>
                  </select>
                </label>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.selectField}>
                  Fecha de desembolso
                  <select
                    name="disbursementRule"
                    value={formState.disbursementRule}
                    onChange={updateField}
                  >
                    <option value="immediate">Inmediata</option>
                    <option value="days_after_issue">X días después de emitir</option>
                    <option value="day_of_month">Día fijo del mes</option>
                    <option value="manual">Manual en el documento</option>
                  </select>
                </label>

                {formState.disbursementRule === 'days_after_issue' && (
                  <TextInput
                    label="Días para desembolso"
                    name="disbursementDays"
                    type="number"
                    min="0"
                    value={formState.disbursementDays}
                    placeholder={formState.dueDays || '0'}
                    fullWidth
                    onChange={updateField}
                  />
                )}

                {formState.disbursementRule === 'day_of_month' && (
                  <TextInput
                    label="Día del mes"
                    name="disbursementDayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    value={formState.disbursementDayOfMonth}
                    placeholder="1"
                    fullWidth
                    onChange={updateField}
                  />
                )}
              </div>

              <div className={styles.optionGroup}>
                <label className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formState.isDefault}
                    onChange={updateField}
                  />
                  Método predeterminado
                </label>

                <label className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    name="requiresApprovalReference"
                    checked={formState.requiresApprovalReference}
                    onChange={updateField}
                  />
                  Requiere referencia de aprobación
                </label>

                <label className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    name="requiresDeliveryConfirmation"
                    checked={formState.requiresDeliveryConfirmation}
                    onChange={updateField}
                  />
                  Requiere confirmación de entrega
                </label>

                <label className={styles.checkboxField}>
                  <input
                    type="checkbox"
                    name="supportsInstallments"
                    checked={formState.supportsInstallments}
                    onChange={updateField}
                  />
                  Permite cuotas
                </label>
              </div>

              {formState.supportsInstallments && (
                <div className={styles.formGrid}>
                  <TextInput
                    label="Cuotas mínimas"
                    name="minInstallments"
                    type="number"
                    min="1"
                    value={formState.minInstallments}
                    placeholder="1"
                    fullWidth
                    onChange={updateField}
                  />

                  <TextInput
                    label="Cuotas máximas"
                    name="maxInstallments"
                    type="number"
                    min="1"
                    value={formState.maxInstallments}
                    placeholder="12"
                    fullWidth
                    onChange={updateField}
                  />
                </div>
              )}

              <div className={styles.formGrid}>
                <label className={styles.selectField}>
                  Comisión financiera
                  <select
                    name="financialFeeType"
                    value={formState.financialFeeType}
                    onChange={updateField}
                  >
                    <option value="none">Sin comisión</option>
                    <option value="fixed">Valor fijo</option>
                    <option value="percentage">Porcentaje</option>
                    <option value="custom">Personalizada</option>
                  </select>
                </label>

                <TextInput
                  label="Valor de comisión"
                  name="financialFeeValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.financialFeeValue}
                  placeholder={formState.financialFeeType === 'percentage' ? '2.5' : '0'}
                  suffix={formState.financialFeeType === 'percentage' ? '%' : undefined}
                  disabled={formState.financialFeeType === 'none' || formState.financialFeeType === 'custom'}
                  fullWidth
                  onChange={updateField}
                />
              </div>
            </Modal.Body>

            <footer className={styles.modalFooter}>
              <Button theme="optional" variant="outline" size="medium" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="medium"
                loading={isCreatingPaymentMethod || isUpdatingPaymentMethod}
              >
                Guardar
              </Button>
            </footer>
          </form>
        </Modal.Window>
      )}
    </div>
  );
};
