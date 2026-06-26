import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menus, Select, TextInput } from '@hlb/design-system';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Eye,
  FileUp,
  GripVertical,
  LockKeyhole,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { formatCurrency } from '@hlb/foundation';
import type { Document as SalesDocument, ISODateTimeString, PaymentMethod } from '@hlb/contracts';
import { useContacts } from '@/modules/contacts/hooks';
import { usePaymentMethods } from '@/modules/settings/payment-methods/hooks';
import { useCreateDocument, useDocument, useUpdateDocument } from '../../hooks';
import type { CreateDocumentPayload, DocumentConfig, DocumentLineForm } from '../../types';
import { ItemSelectorModal } from '../ItemSelectorModal';
import styles from './DocumentEditor.module.css';

type DocumentEditorProps = {
  config: DocumentConfig;
  documentId?: string | null;
};

type DocumentFormState = {
  contactId: string;
  contactName: string;
  docNumber: string;
  date: string;
  dueDate: string;
  disbursementDate: string;
  paymentMethodId: string;
  financialFeeCustomValue: string;
  account: string;
  tags: string;
  internalNote: string;
};

const today = new Date().toISOString().slice(0, 10);

const getInitialFormState = (kind: DocumentConfig['kind']): DocumentFormState => ({
  contactId: '',
  contactName: '',
  docNumber: nextDocumentNumber(kind),
  date: today,
  dueDate: '',
  disbursementDate: '',
  paymentMethodId: '',
  financialFeeCustomValue: '',
  account: '',
  tags: '',
  internalNote: '',
});

const initialLine = (): DocumentLineForm => ({
  id: crypto.randomUUID(),
  concept: '',
  description: '',
  quantity: '1',
  price: '0',
  tax: '0',
});

const toNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const isoToInputDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return toInputDate(date);
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const nextDayOfMonth = (date: Date, dayOfMonth: number) => {
  const day = Math.min(Math.max(dayOfMonth, 1), 31);
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(date.getMonth() + (date.getDate() >= day ? 1 : 0));
  next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  return next;
};

const resolveDisbursementInputDate = (
  paymentMethod: PaymentMethod | undefined,
  issueDate: string,
) => {
  if (!paymentMethod) return '';

  const baseDate = new Date(issueDate || today);
  if (Number.isNaN(baseDate.getTime())) return '';

  if (paymentMethod.disbursementRule === 'manual') return '';

  if (
    paymentMethod.disbursementRule === 'immediate' ||
    paymentMethod.settlementMode === 'instant'
  ) {
    return toInputDate(baseDate);
  }

  if (paymentMethod.disbursementRule === 'day_of_month') {
    return toInputDate(nextDayOfMonth(baseDate, paymentMethod.disbursementDayOfMonth ?? 1));
  }

  return toInputDate(
    addDays(baseDate, paymentMethod.disbursementDays ?? paymentMethod.dueDays ?? 0),
  );
};

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const nextDocumentNumber = (kind: DocumentConfig['kind']) => {
  const prefix = kind === 'invoice' ? 'F' : kind === 'purchase' ? 'C' : 'P';
  return `${prefix}${new Date().getFullYear().toString().slice(-2)}0001`;
};

const isLineEmpty = (line: DocumentLineForm) =>
  !line.concept.trim() &&
  !line.description.trim() &&
  !line.productId &&
  !line.serviceId &&
  !line.sku;

const hasFinancialFee = (paymentMethod?: PaymentMethod) =>
  Boolean(paymentMethod?.financialFeeType && paymentMethod.financialFeeType !== 'none');

const documentToFormState = (
  document: SalesDocument,
  fallback: DocumentFormState,
): DocumentFormState => ({
  ...fallback,
  contactId: document.contactId ? String(document.contactId) : '',
  contactName: document.contactName ?? '',
  docNumber: document.docNumber ?? fallback.docNumber,
  date: isoToInputDate(document.date) || fallback.date,
  dueDate: isoToInputDate(document.dueDate),
  disbursementDate: isoToInputDate(document.disbursementDate),
  paymentMethodId: document.paymentMethodId ? String(document.paymentMethodId) : '',
  financialFeeCustomValue:
    document.financialFeeType === 'custom' && document.financialFeeValue !== undefined
      ? String(document.financialFeeValue)
      : '',
  tags: Array.isArray(document.tags) ? document.tags.join(', ') : '',
});

const documentToLines = (document: SalesDocument): DocumentLineForm[] => {
  const mappedLines =
    document.lines?.map((line) => ({
      id: line.id || crypto.randomUUID(),
      concept: line.concept ?? '',
      description: line.description ?? '',
      quantity: String(line.units ?? 1),
      price: String(line.price ?? 0),
      tax: String(line.tax ?? 0),
      productId: line.productId,
      serviceId: line.serviceId,
      sku: line.sku,
    })) ?? [];

  return mappedLines.length > 0 ? mappedLines : [initialLine()];
};

export const DocumentEditor = ({ config, documentId }: DocumentEditorProps) => {
  const navigate = useNavigate();
  const isPurchase = config.kind === 'purchase';
  const isEditing = Boolean(documentId);
  const [formState, setFormState] = useState<DocumentFormState>(() =>
    getInitialFormState(config.kind),
  );
  const [lines, setLines] = useState<DocumentLineForm[]>([initialLine(), initialLine()]);
  const [initializedDocumentId, setInitializedDocumentId] = useState<string | null>(null);
  const [dragLineId, setDragLineId] = useState<string | null>(null);
  const [dropLineId, setDropLineId] = useState<string | null>(null);
  const [isFilePanelCollapsed, setIsFilePanelCollapsed] = useState(false);
  const [supportFileName, setSupportFileName] = useState('');
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTouchedPaymentMethod, setHasTouchedPaymentMethod] = useState(false);
  const { contacts } = useContacts({ page: 1, limit: 100, search: '', scope: 'all' });
  const { paymentMethods } = usePaymentMethods({ page: 1, limit: 100 });
  const { createDocumentAsync, isCreatingDocument } = useCreateDocument(config.kind);
  const { document, isLoading: isLoadingDocument } = useDocument(config.kind, documentId);
  const { isUpdatingDocument, updateDocumentAsync } = useUpdateDocument(config.kind);
  const isSavingDocument = isCreatingDocument || isUpdatingDocument;
  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find(
        (paymentMethod) => String(paymentMethod.id) === formState.paymentMethodId,
      ),
    [formState.paymentMethodId, paymentMethods],
  );
  const shouldShowCurrentContactOption = Boolean(
    formState.contactId && !contacts.some((contact) => String(contact.id) === formState.contactId),
  );
  const selectedFinancialFeeMethod = hasFinancialFee(selectedPaymentMethod)
    ? selectedPaymentMethod
    : undefined;
  const isCustomFinancialFee = selectedFinancialFeeMethod?.financialFeeType === 'custom';
  const shouldShowDisbursementDate = Boolean(
    selectedPaymentMethod &&
    selectedPaymentMethod.disbursementRule !== 'immediate' &&
    selectedPaymentMethod.settlementMode !== 'instant',
  );
  const isManualDisbursementDate = selectedPaymentMethod?.disbursementRule === 'manual';

  useEffect(() => {
    if (!document || !documentId || initializedDocumentId === documentId) return;

    const nextFormState = documentToFormState(document, getInitialFormState(config.kind));
    setFormState(nextFormState);
    setLines(documentToLines(document));
    setInitializedDocumentId(documentId);
  }, [config.kind, document, documentId, initializedDocumentId]);

  useEffect(() => {
    if (isEditing || hasTouchedPaymentMethod || formState.paymentMethodId) return;

    const defaultPaymentMethod = paymentMethods.find((paymentMethod) => paymentMethod.isDefault);
    if (!defaultPaymentMethod) return;

    setFormState((current) => {
      if (current.paymentMethodId) return current;

      return {
        ...current,
        paymentMethodId: String(defaultPaymentMethod.id),
        disbursementDate: resolveDisbursementInputDate(defaultPaymentMethod, current.date),
        financialFeeCustomValue: '',
      };
    });
  }, [formState.paymentMethodId, hasTouchedPaymentMethod, isEditing, paymentMethods]);

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        const subtotal = toNumber(line.price) * toNumber(line.quantity);
        const tax = subtotal * (toNumber(line.tax) / 100);
        return {
          subtotal: acc.subtotal + subtotal,
          tax: acc.tax + tax,
          total: acc.total + subtotal + tax,
        };
      },
      { subtotal: 0, tax: 0, total: 0 },
    );
  }, [lines]);

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((current) => {
      if (name === 'date' && selectedPaymentMethod) {
        return {
          ...current,
          date: value,
          disbursementDate:
            current.disbursementDate && selectedPaymentMethod.disbursementRule === 'manual'
              ? current.disbursementDate
              : resolveDisbursementInputDate(selectedPaymentMethod, value),
        };
      }

      return { ...current, [name]: value };
    });
    setError(null);
  };

  const updateLine = (id: string, field: keyof DocumentLineForm, value: string) => {
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, [field]: value } : line)),
    );
  };

  const handleContactChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const contactId = event.target.value;
    const contact = contacts.find((item) => String(item.id) === contactId);

    setFormState((current) => ({
      ...current,
      contactId,
      contactName: contactId ? contact?.tradeName || contact?.name || '' : current.contactName,
    }));
    setError(null);
  };

  const handlePaymentMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const paymentMethodId = event.target.value;
    const paymentMethod = paymentMethods.find((item) => String(item.id) === paymentMethodId);

    setHasTouchedPaymentMethod(true);
    setFormState((current) => ({
      ...current,
      paymentMethodId,
      disbursementDate: resolveDisbursementInputDate(paymentMethod, current.date),
      financialFeeCustomValue: '',
    }));
    setError(null);
  };

  const addLine = (line: DocumentLineForm = initialLine()) => {
    setLines((current) => [...current, line]);
  };

  const removeLine = (id: string) => {
    setLines((current) =>
      current.length > 1 ? current.filter((line) => line.id !== id) : current,
    );
  };

  const reorderLines = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setLines((current) => {
      const sourceIndex = current.findIndex((line) => line.id === sourceId);
      const targetIndex = current.findIndex((line) => line.id === targetId);

      if (sourceIndex < 0 || targetIndex < 0) return current;

      const next = [...current];
      const [movedLine] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, movedLine);

      return next;
    });
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, id: string) => {
    if (isSavingDocument) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
    setDragLineId(id);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, id: string) => {
    if (!dragLineId || dragLineId === id) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropLineId(id);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain') || dragLineId;

    if (sourceId) reorderLines(sourceId, id);

    setDragLineId(null);
    setDropLineId(null);
  };

  const clearDragState = () => {
    setDragLineId(null);
    setDropLineId(null);
  };

  const selectSupportFile = (file?: File) => {
    if (!file) return;
    setSupportFileName(file.name);
  };

  const handleSupportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectSupportFile(event.target.files?.[0]);
  };

  const handleSupportFileDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    selectSupportFile(event.dataTransfer.files?.[0]);
  };

  const buildPayload = (): CreateDocumentPayload => {
    const activeLines = lines.filter((line) => line.concept.trim() || line.description.trim());

    return {
      contactId: (formState.contactId || undefined) as CreateDocumentPayload['contactId'],
      contactName: formState.contactName.trim(),
      docNumber: formState.docNumber.trim(),
      date: new Date(formState.date || today).toISOString() as ISODateTimeString,
      dueDate: (formState.dueDate
        ? new Date(formState.dueDate).toISOString()
        : new Date(formState.date || today).toISOString()) as ISODateTimeString,
      disbursementDate: formState.disbursementDate
        ? (new Date(formState.disbursementDate).toISOString() as ISODateTimeString)
        : undefined,
      description: activeLines[0]?.concept || '',
      paymentMethodId: formState.paymentMethodId,
      financialFeePaymentMethodId: selectedFinancialFeeMethod
        ? String(selectedFinancialFeeMethod.id)
        : undefined,
      financialFeeName: selectedFinancialFeeMethod?.name,
      financialFeeType: selectedFinancialFeeMethod?.financialFeeType ?? 'none',
      financialFeeValue:
        selectedFinancialFeeMethod?.financialFeeType === 'custom'
          ? toNumber(formState.financialFeeCustomValue)
          : selectedFinancialFeeMethod?.financialFeeType === 'fixed' ||
              selectedFinancialFeeMethod?.financialFeeType === 'percentage'
            ? Number(selectedFinancialFeeMethod.financialFeeValue ?? 0)
            : undefined,
      currency: 'COP',
      language: 'es-CO',
      tags: splitList(formState.tags),
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      discount: 0,
      lines: activeLines.map((line) => ({
        id: line.id,
        concept: line.concept.trim(),
        description: line.description.trim(),
        price: toNumber(line.price),
        units: toNumber(line.quantity),
        tax: toNumber(line.tax),
        taxes: [`IVA ${line.tax}%`],
        productId: line.productId as never,
        serviceId: line.serviceId as never,
        sku: line.sku,
      })),
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.contactName.trim()) {
      setError('Selecciona un contacto existente o escribe el nombre manualmente.');
      return;
    }

    if (!lines.some((line) => line.concept.trim())) {
      setError('Añade al menos una línea al documento.');
      return;
    }

    if (isCustomFinancialFee && !formState.financialFeeCustomValue.trim()) {
      setError('Ingresa el valor de la comisión financiera personalizada.');
      return;
    }

    try {
      if (documentId) {
        const updated = await updateDocumentAsync({ documentId, payload: buildPayload() });
        navigate(`${config.listPath}#open:${updated.id ?? documentId}`);
        return;
      }

      const created = await createDocumentAsync(buildPayload());
      navigate(`${config.listPath}#open:${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar el documento.');
    }
  };

  return (
    <main className={styles.editorPage}>
      <title>
        {isEditing ? `Editar ${config.singularTitle.toLowerCase()}` : config.newLabel} - Helebba
      </title>

      <header className={styles.editorHeader}>
        <h1 className={styles.editorTitle}>
          <button
            className={styles.backButton}
            type="button"
            aria-label="Volver"
            onClick={() => navigate(config.listPath)}
          >
            <ArrowLeft size={19} />
          </button>
          {isEditing ? `Editar ${config.singularTitle.toLowerCase()}` : config.newLabel}
        </h1>

        <div className={styles.headerActions}>
          <Button
            className={styles.iconButton}
            variant="outline"
            theme="optional"
            size="medium"
            icon={<BookOpen size={16} />}
            aria-label="Ayuda"
          />
          <Button variant="outline" theme="optional" size="medium" icon={<Eye size={16} />}>
            Vista previa
          </Button>
          <Button
            variant="outline"
            theme="optional"
            size="medium"
            icon={<SlidersHorizontal size={16} />}
          >
            Opciones
          </Button>
          <Button
            variant="outline"
            theme="optional"
            size="medium"
            disabled={isSavingDocument || isLoadingDocument}
          >
            Guardar como borrador
          </Button>
          <Button
            type="submit"
            form="document-editor-form"
            loading={isSavingDocument}
            disabled={isLoadingDocument}
            icon={isPurchase ? <Check size={16} /> : <LockKeyhole size={16} />}
          >
            {isEditing ? 'Guardar cambios' : isPurchase ? 'Guardar' : 'Aprobar'}
          </Button>
          {isPurchase && (
            <Menus defaultPlacement="bottom-end">
              <Menus.Menu>
                <Menus.Toggle
                  id="purchase-save-options"
                  className={styles.splitSaveButton}
                  aria-label="Opciones de guardado"
                >
                  <ChevronDown size={16} />
                </Menus.Toggle>
                <Menus.List id="purchase-save-options" placement="bottom-end">
                  <Menus.Item id="save-and-new">Guardar y crear nuevo</Menus.Item>
                  <Menus.Item id="cancel-purchase" onClick={() => navigate(config.listPath)}>
                    Cancelar
                  </Menus.Item>
                </Menus.List>
              </Menus.Menu>
            </Menus>
          )}
        </div>
      </header>

      <form
        id="document-editor-form"
        className={`${styles.formPanel} ${isPurchase ? styles.purchaseFormPanel : ''} ${isFilePanelCollapsed ? styles.purchaseFormPanelCollapsed : ''}`}
        onSubmit={handleSubmit}
      >
        {isPurchase && (
          <aside className={styles.purchaseFilePanel} aria-label="Archivo de compra">
            {isFilePanelCollapsed ? (
              <button
                className={styles.expandFilePanelButton}
                type="button"
                aria-label="Mostrar panel de archivo"
                onClick={() => setIsFilePanelCollapsed(false)}
              >
                <PanelLeftOpen size={18} />
              </button>
            ) : (
              <>
                <div className={styles.filePanelHeader}>
                  <h2>Archivo</h2>
                  <Menus defaultPlacement="bottom-end">
                    <Menus.Menu>
                      <Menus.Toggle
                        id="purchase-file-menu"
                        className={styles.filePanelMenuButton}
                        aria-label="Opciones del archivo"
                      >
                        <MoreHorizontal size={18} />
                      </Menus.Toggle>
                      <Menus.List id="purchase-file-menu" placement="bottom-end">
                        <Menus.Item
                          id="minimize-file-panel"
                          onClick={() => setIsFilePanelCollapsed(true)}
                        >
                          Minimizar
                        </Menus.Item>
                        <Menus.Item id="change-file-view">Cambiar vista</Menus.Item>
                      </Menus.List>
                    </Menus.Menu>
                  </Menus>
                </div>

                <label
                  className={styles.fileDropzone}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleSupportFileDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleSupportFileChange}
                  />
                  <FileUp size={30} />
                  <span>{supportFileName || 'Selecciona o arrastra un documento'}</span>
                </label>

                <button
                  className={styles.minimizeFilePanelButton}
                  type="button"
                  onClick={() => setIsFilePanelCollapsed(true)}
                >
                  <PanelLeftClose size={16} /> Minimizar
                </button>
              </>
            )}
          </aside>
        )}

        <div className={isPurchase ? styles.purchaseEditorArea : undefined}>
          <div className={styles.topFields}>
            <label className={styles.selectField}>
              Contacto
              <select
                name="contactId"
                value={formState.contactId}
                disabled={isSavingDocument}
                onChange={handleContactChange}
              >
                <option value="">Sin contacto seleccionado</option>
                {shouldShowCurrentContactOption && (
                  <option value={formState.contactId}>
                    {formState.contactName || 'Contacto actual'}
                  </option>
                )}
                {contacts.map((contact) => (
                  <option key={String(contact.id)} value={String(contact.id)}>
                    {contact.tradeName || contact.name}
                    {contact.email ? ` - ${contact.email}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <TextInput
              label="Nombre del contacto"
              name="contactName"
              value={formState.contactName}
              disabled={isSavingDocument || Boolean(formState.contactId)}
              placeholder="Escribe el nombre"
              onChange={updateField}
            />
            <TextInput
              label="Número de documento"
              name="docNumber"
              value={formState.docNumber}
              disabled={isSavingDocument}
              onChange={updateField}
            />
            <TextInput
              label={isPurchase ? 'Fecha emisión' : 'Fecha'}
              name="date"
              type="date"
              value={formState.date}
              disabled={isSavingDocument}
              onChange={updateField}
            />
            <TextInput
              label="Vencimiento"
              name="dueDate"
              type="date"
              value={formState.dueDate}
              disabled={isSavingDocument}
              onChange={updateField}
            />
          </div>

          <div className={styles.tableScroll}>
            <div className={styles.linesTable}>
              <div className={styles.linesHeader}>
                <span />
                <span>Concepto</span>
                <span>Descripción</span>
                <span>Cantidad</span>
                <span>Precio</span>
                <span>Impuestos</span>
                <span>Total</span>
                <span />
              </div>

              {lines.map((line) => {
                const lineSubtotal = toNumber(line.price) * toNumber(line.quantity);
                const lineTotal = lineSubtotal + lineSubtotal * (toNumber(line.tax) / 100);

                return (
                  <div
                    className={`${styles.lineRow} ${dragLineId === line.id ? styles.draggingLine : ''} ${dropLineId === line.id ? styles.dropTargetLine : ''}`}
                    key={line.id}
                    onDragOver={(event) => handleDragOver(event, line.id)}
                    onDragLeave={() =>
                      setDropLineId((current) => (current === line.id ? null : current))
                    }
                    onDrop={(event) => handleDrop(event, line.id)}
                  >
                    <button
                      className={styles.dragCell}
                      type="button"
                      draggable={!isSavingDocument}
                      aria-label="Arrastrar línea"
                      onDragStart={(event) => handleDragStart(event, line.id)}
                      onDragEnd={clearDragState}
                    >
                      <GripVertical size={15} />
                    </button>
                    <div className={styles.conceptCell}>
                      <input
                        className={styles.cellInput}
                        placeholder="Escribe el concepto o usa @ para buscar"
                        value={line.concept}
                        disabled={isSavingDocument}
                        onChange={(event) => updateLine(line.id, 'concept', event.target.value)}
                      />
                      <button
                        className={styles.conceptSearch}
                        type="button"
                        aria-label="Buscar item"
                        onClick={() => setShowItemSelector(true)}
                      >
                        <BookOpen size={16} />
                      </button>
                    </div>
                    <textarea
                      className={styles.cellTextarea}
                      placeholder="Desc"
                      value={line.description}
                      disabled={isSavingDocument}
                      onChange={(event) => updateLine(line.id, 'description', event.target.value)}
                    />
                    <input
                      className={styles.cellInput}
                      value={line.quantity}
                      inputMode="decimal"
                      disabled={isSavingDocument}
                      onChange={(event) => updateLine(line.id, 'quantity', event.target.value)}
                    />
                    <input
                      className={styles.cellInput}
                      value={line.price}
                      inputMode="decimal"
                      disabled={isSavingDocument}
                      onChange={(event) => updateLine(line.id, 'price', event.target.value)}
                    />
                    <label className={styles.taxField}>
                      <span>IVA</span>
                      <input
                        value={line.tax}
                        inputMode="decimal"
                        disabled={isSavingDocument}
                        onChange={(event) => updateLine(line.id, 'tax', event.target.value)}
                      />
                      <span>%</span>
                    </label>
                    <span className={styles.totalCell}>{formatCurrency(lineTotal)}</span>
                    <button
                      className={styles.deleteLine}
                      type="button"
                      aria-label="Eliminar línea"
                      onClick={() => removeLine(line.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.contentArea}>
            <div className={styles.leftOptions}>
              <div className={styles.lineActions}>
                <Button variant="outline" theme="optional" size="medium" onClick={() => addLine()}>
                  Añadir línea
                </Button>
                <Button
                  className={styles.iconButton}
                  variant="outline"
                  theme="optional"
                  size="medium"
                  disclosure
                />
              </div>
              <label className={styles.checkboxOption}>
                <input type="checkbox" /> Campos personalizados
              </label>
              <label className={styles.checkboxOption}>
                <input type="checkbox" /> Añadir texto en el documento
              </label>
              <label className={styles.checkboxOption}>
                <input type="checkbox" /> Añadir mensaje al final
              </label>
              {error && <div className={styles.error}>{error}</div>}
            </div>

            <aside className={styles.summary} aria-label="Totales">
              <button className={styles.summaryLink} type="button">
                + Añadir descuento
              </button>
              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <strong>{formatCurrency(totals.subtotal)}</strong>
                </div>
                <div className={styles.totalRow}>
                  <span>IVA</span>
                  <strong>{formatCurrency(totals.tax)}</strong>
                </div>
                <div className={styles.totalRow}>
                  <strong>Total</strong>
                  <strong>{formatCurrency(totals.total)}</strong>
                </div>
              </div>
            </aside>
          </div>

          <div className={styles.bottomSections}>
            <section className={styles.bottomCard}>
              <h2>Método de pago</h2>
              <Select
                name="paymentMethodId"
                label="Selecciona una forma de pago"
                value={formState.paymentMethodId}
                disabled={isSavingDocument}
                onChange={handlePaymentMethodChange}
                options={[
                  { label: 'No seleccionado', value: '' },
                  ...paymentMethods.map((paymentMethod) => ({
                    label: `${paymentMethod.name}${paymentMethod.isDefault ? ' · Predeterminado' : ''}`,
                    value: paymentMethod.id,
                  })),
                ]}
              />
              {isCustomFinancialFee && (
                <TextInput
                  label="Valor de comisión personalizada"
                  name="financialFeeCustomValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.financialFeeCustomValue}
                  disabled={isSavingDocument}
                  onChange={updateField}
                />
              )}
              {shouldShowDisbursementDate && (
                <TextInput
                  label="Fecha de desembolso"
                  name="disbursementDate"
                  type="date"
                  value={formState.disbursementDate}
                  disabled={isSavingDocument || !isManualDisbursementDate}
                  onChange={updateField}
                />
              )}
              <div className={styles.walletBanner}>
                <strong>Conecta tu pasarela de pago para cobrar online de forma rápida</strong>
                <div className={styles.walletLogos}>
                  <span>
                    <img src="/pm_stripe.png" style={{ width: 60 }} />
                  </span>
                  <span>
                    <img src="/pm_paypal.png" style={{ width: 80 }} />
                  </span>
                  <span>
                    <img src="/Mercado_Pago.svg.png" style={{ width: 120 }} />
                  </span>
                  <span>
                    <img src="/Wompi_LogoPrincipal.svg" style={{ width: 120 }} />
                  </span>
                </div>
                <Button variant="outline" theme="optional" size="medium">
                  Conectar
                </Button>
              </div>
            </section>

            <section className={styles.bottomCard}>
              <h2>Categorización</h2>
              <label className={styles.selectField}>
                Cuenta contable
                <select
                  name="account"
                  value={formState.account}
                  disabled={isSavingDocument}
                  onChange={updateField}
                >
                  <option value="">Seleccionar cuenta</option>
                  <option value="No asignado">No asignado</option>
                </select>
              </label>
              <label className={styles.checkboxOption}>
                <input type="checkbox" /> Cuenta por concepto
              </label>
              <TextInput
                label="Etiquetas"
                name="tags"
                placeholder="Tags"
                value={formState.tags}
                disabled={isSavingDocument}
                onChange={updateField}
              />
              <label className={styles.checkboxOption}>
                <input type="checkbox" /> Etiquetas por concepto
              </label>
              <TextInput
                label="Nota interna"
                name="internalNote"
                placeholder="Nota interna"
                value={formState.internalNote}
                disabled={isSavingDocument}
                onChange={updateField}
              />
            </section>
          </div>
        </div>
      </form>

      {showItemSelector && (
        <ItemSelectorModal
          onClose={() => setShowItemSelector(false)}
          onSelect={(line) => {
            setLines((current) => {
              const firstEmpty = current.find(isLineEmpty);
              if (!firstEmpty) return [...current, line];

              return current.map((item) =>
                item.id === firstEmpty.id ? { ...line, id: item.id } : item,
              );
            });
          }}
        />
      )}
    </main>
  );
};
