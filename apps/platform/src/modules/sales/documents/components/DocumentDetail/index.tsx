import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Menus } from '@hlb/design-system';
import { formatCurrency } from '@hlb/foundation';
import { ArrowLeftRight, LockKeyhole, Send, Share2, X } from 'lucide-react';
import { useSession } from '@/shared';
import { PaymentFormModal } from '@/modules/accounting/payments/components';
import { useConvertDocument, useDeleteDocument, useDocument, useSendDocumentEmail } from '../../hooks';
import type { DocumentConfig, DocumentRow } from '../../types';
import styles from './DocumentDetail.module.css';

type DocumentDetailProps = {
  config: DocumentConfig;
  documentId: string | null;
  fallback?: DocumentRow | null;
  onClose: () => void;
  onDeleted?: () => void;
};

type SendEmailFormState = {
  bcc: string;
  cc: string;
  message: string;
  subject: string;
  to: string;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const getDefaultMessage = ({
  contactName,
  dueDate,
  docNumber,
  organizationName,
  singularTitle,
  total,
}: {
  contactName?: string;
  dueDate?: string;
  docNumber?: string;
  organizationName: string;
  singularTitle: string;
  total: number;
}) =>
  [
    `Hola ${contactName || 'cliente'},`,
    `Aquí tienes ${singularTitle.toLowerCase()} ${docNumber ?? ''} de ${organizationName}.`,
    dueDate ? `El documento vence el ${formatDate(dueDate)}.` : '',
    `Total: ${formatCurrency(total)}.`,
    'Si tienes alguna duda, contacta con nosotros.',
    'Gracias,',
    organizationName,
  ]
    .filter(Boolean)
    .join('\n\n');

export const DocumentDetail = ({ config, documentId, fallback, onClose, onDeleted }: DocumentDetailProps) => {
  const navigate = useNavigate();
  const { convertDocument, isConvertingDocument } = useConvertDocument(config.kind);
  const { deleteDocumentAsync } = useDeleteDocument(config.kind);
  const {
    error: sendEmailError,
    isSendingDocumentEmail,
    sendDocumentEmail,
  } = useSendDocumentEmail(config.kind);
  const { document: loadedDocument, isLoading } = useDocument(config.kind, documentId);
  const organization = useSession((state) => state.organization);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [showCopyFields, setShowCopyFields] = useState(false);
  const [sendEmailForm, setSendEmailForm] = useState<SendEmailFormState>({
    bcc: '',
    cc: '',
    message: '',
    subject: '',
    to: '',
  });
  const current = loadedDocument ?? fallback?.source;
  const organizationName = organization?.legalName || organization?.name || 'tu empresa';

  useEffect(() => {
    if (!documentId) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (isSendModalOpen) {
        setIsSendModalOpen(false);
        return;
      }

      onClose();
    };

    window.document.addEventListener('keydown', handleKeyDown);

    return () => window.document.removeEventListener('keydown', handleKeyDown);
  }, [documentId, isSendModalOpen, onClose]);

  const lines = useMemo(() => current?.lines ?? [], [current?.lines]);

  const updateSendEmailForm = (field: keyof SendEmailFormState, value: string) => {
    setSendEmailForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleOpenSendModal = () => {
    if (!current) return;

    setSendEmailForm({
      bcc: '',
      cc: '',
      message: getDefaultMessage({
        contactName: current.contactName,
        docNumber: current.docNumber,
        dueDate: current.dueDate,
        organizationName,
        singularTitle: config.singularTitle,
        total: Number(current.total ?? 0),
      }),
      subject: `${config.singularTitle} ${current.docNumber ?? ''} de ${organizationName} para ${
        current.contactName || 'cliente'
      }`.trim(),
      to: '',
    });
    setShowCopyFields(false);
    setIsSendModalOpen(true);
  };

  const handleCloseSendModal = () => {
    if (isSendingDocumentEmail) return;
    setIsSendModalOpen(false);
  };

  const handleSendEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!documentId) return;

    await sendDocumentEmail({
      documentId,
      payload: {
        bcc: sendEmailForm.bcc,
        cc: sendEmailForm.cc,
        message: sendEmailForm.message,
        subject: sendEmailForm.subject,
        to: sendEmailForm.to,
      },
    });
    setIsSendModalOpen(false);
  };

  const handleDeleteDocument = async () => {
    if (!documentId || !current) return;

    const shouldDelete = window.confirm(
      `¿Eliminar ${config.singularTitle.toLowerCase()} ${current.docNumber}? Esta acción también eliminará sus pagos asociados.`,
    );

    if (!shouldDelete) return;

    await deleteDocumentAsync(documentId);
    onDeleted?.();
  };

  if (!documentId) return null;

  const title = current
    ? `${current.contactName || '-'} - ${config.singularTitle} ${current.docNumber}`
    : config.singularTitle;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <header className={styles.topbar}>
        <div className={styles.title}>
          <button
            className={styles.closeButton}
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X size={18} />
          </button>
          <span>{title}</span>
          <span className={styles.approved}>
            <LockKeyhole size={14} /> Documento aprobado
          </span>
        </div>

        <div className={styles.topActions}>
          <Button
            variant="outline"
            theme="optional"
            size="medium"
            icon={<ArrowLeftRight size={16} />}
            loading={isConvertingDocument}
            onClick={() => documentId && convertDocument(documentId)}
          >
            Convertir
          </Button>
          <Button
            className={styles.iconButton}
            variant="outline"
            theme="optional"
            size="medium"
            icon={<Share2 size={16} />}
            aria-label="Compartir"
          />
          <Menus defaultPlacement="bottom-end">
            <Menus.Menu>
              <Menus.Toggle
                id={`document-detail-actions-${documentId}`}
                className={styles.iconButton}
                verticalIcon
                aria-label="Más acciones"
              />
              <Menus.List id={`document-detail-actions-${documentId}`} placement="bottom-end">
                <Menus.Item id="print">Imprimir</Menus.Item>
                <Menus.Item id="download">Descargar</Menus.Item>
                <Menus.Item id="electronic">Factura-e</Menus.Item>
                <Menus.Item id="duplicate">Duplicar</Menus.Item>
                <Menus.Item id="edit" onClick={() => documentId && navigate(`${config.listPath}/${documentId}/edit`)}>
                  Editar
                </Menus.Item>
                <Menus.Item id="delete" danger onClick={handleDeleteDocument}>
                  Eliminar
                </Menus.Item>
                <Menus.Item id="cancel" danger>
                  Anular
                </Menus.Item>
              </Menus.List>
            </Menus.Menu>
          </Menus>
          <Button
            size="medium"
            icon={<Send size={16} />}
            onClick={handleOpenSendModal}
            disabled={!current}
          >
            Enviar
          </Button>
        </div>
      </header>
      <section className={styles.main}>
        <div className={styles.previewArea}>
          <article className={styles.paper} aria-busy={isLoading}>
            <h2>{config.singularTitle}</h2>
            <div className={styles.paperMeta}>
              <strong>Número #</strong>
              <span>{current?.docNumber ?? '-'}</span>
              <strong>Fecha</strong>
              <span>{formatDate(current?.date)}</span>
              <strong>Vencimiento</strong>
              <span>{formatDate(current?.dueDate)}</span>
            </div>

            <div className={styles.paperParties}>
              <div className={styles.party}>
                <strong>Snapprra LLC</strong>
                <span>Colombia</span>
                <span>B12345678</span>
                <span>3226589914</span>
                <span>yunsde26@gmail.com</span>
              </div>
              <div className={styles.party}>
                <strong>Cliente</strong>
                <span>{current?.contactName ?? '-'}</span>
              </div>
            </div>

            <table className={styles.invoiceTable}>
              <thead>
                <tr>
                  <th>CONCEPTO</th>
                  <th>PRECIO</th>
                  <th>UNIDADES</th>
                  <th>SUBTOTAL</th>
                  <th>IVA</th>
                  <th>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {lines.length > 0 ? (
                  lines.map((line, index) => {
                    const subtotal = Number(line.price ?? 0) * Number(line.units ?? 0);
                    const tax = subtotal * (Number(line.tax ?? 0) / 100);
                    return (
                      <tr key={line.id ?? index}>
                        <td>
                          <strong>{line.concept ?? '-'}</strong>
                          <br />
                          {line.description}
                        </td>
                        <td>{formatCurrency(Number(line.price ?? 0))}</td>
                        <td>{line.units ?? 0}</td>
                        <td>{formatCurrency(subtotal)}</td>
                        <td>{line.tax ?? 0}%</td>
                        <td>{formatCurrency(subtotal + tax)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td>-</td>
                    <td>{formatCurrency(0)}</td>
                    <td>0</td>
                    <td>{formatCurrency(0)}</td>
                    <td>0%</td>
                    <td>{formatCurrency(0)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className={styles.totals}>
              <div>
                <span>BASE IMPONIBLE</span>
                <strong>{formatCurrency(Number(current?.subtotal ?? 0))}</strong>
              </div>
              <div>
                <span>IVA</span>
                <strong>{formatCurrency(Number(current?.tax ?? 0))}</strong>
              </div>
              <div>
                <span>TOTAL</span>
                <strong>{formatCurrency(Number(current?.total ?? 0))}</strong>
              </div>
            </div>

            <p className={styles.conditions}>
              <strong>Condiciones de pago</strong>
              <br />
              Pagar por transferencia bancaria al siguiente número de cuenta{' '}
              <strong>Cámbialo en Configuración &gt; Formas de pago</strong>
            </p>
          </article>
        </div>
        <aside className={styles.side}>
          <nav className={styles.tabs} aria-label="Detalle del documento">
            <button type="button">General</button>
            <button type="button">Mensajes</button>
            <button type="button">Historial</button>
          </nav>

          <div className={styles.panel}>
            <div className={styles.summaryHeader}>
              <h3>Total</h3>
              <strong>{formatCurrency(Number(current?.total ?? 0))}</strong>
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span>Número de documento</span>
                <strong>{current?.docNumber ?? '-'}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Contacto</span>
                <a href="#contact">{current?.contactName ?? '-'}</a>
              </div>
              <div className={styles.infoRow}>
                <span>Fecha</span>
                <strong>{formatDate(current?.date)}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Vencimiento</span>
                <strong>{formatDate(current?.dueDate)}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Total unidades</span>
                <strong>{lines.reduce((acc, line) => acc + Number(line.units ?? 0), 0)}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Almacén</span>
                <strong>Snapprra LLC Almacén</strong>
              </div>
            </div>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Pagos</h3>
                <button type="button" onClick={() => setIsPaymentModalOpen(true)}>
                  Conciliar / Añadir pago
                </button>
              </div>
              <div className={styles.infoRow}>
                <span>Pendiente de pago</span>
                <strong>
                  {formatCurrency(Number(current?.paymentsPending ?? current?.total ?? 0))}
                </strong>
              </div>
              {/* <div className={styles.paymentBox}>
              <strong>Cobra esta factura con tarjeta, sin salir de Helebba</strong>
              <span>Activa los cobros online y tus clientes podrán pagarte desde el portal del cliente.</span>
              <Button variant="outline" theme="monochrome" size="medium">
                Activar cobros online
              </Button>
            </div> */}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Vencimiento</h3>
                <button type="button">Editar</button>
              </div>
              <div className={styles.infoRow}>
                <span>Fecha</span>
                <strong>{formatDate(current?.dueDate)}</strong>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Asiento contable</h3>
                <button type="button">Ver</button>
              </div>
              <table className={styles.accountingTable}>
                <thead>
                  <tr>
                    <th />
                    <th>Debe</th>
                    <th>Haber</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total</td>
                    <td>{formatCurrency(Number(current?.total ?? 0))}</td>
                    <td>{formatCurrency(0)}</td>
                  </tr>
                  <tr>
                    <td>Subtotal</td>
                    <td>{formatCurrency(0)}</td>
                    <td>{formatCurrency(Number(current?.subtotal ?? 0))}</td>
                  </tr>
                  <tr>
                    <td>IVA</td>
                    <td>{formatCurrency(0)}</td>
                    <td>{formatCurrency(Number(current?.tax ?? 0))}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </aside>
      </section>

      {isPaymentModalOpen && current && (
        <PaymentFormModal
          initialValues={{
            amount: String(current.paymentsPending ?? current.total ?? 0),
            contactId: String(current.contactId ?? ''),
            contactName: current.contactName ?? '',
            description: `${config.singularTitle} ${current.docNumber}`,
            direction:
              current.docType === 'purchase' || current.docType === 'expenses'
                ? 'outflow'
                : 'inflow',
            documentId: String(current.id ?? documentId ?? ''),
            documentType: String(current.docType),
          }}
          onClose={() => setIsPaymentModalOpen(false)}
        />
      )}

      {isSendModalOpen && current && (
        <div className={styles.modalBackdrop} role="presentation">
          <form className={styles.sendModal} onSubmit={handleSendEmail}>
            <header className={styles.sendModalHeader}>
              <div>
                <h2>Enviar documento</h2>
                <p>
                  {current.contactName || 'Cliente'} · {current.docNumber ?? '-'} ·{' '}
                  {formatDate(current.date)}
                </p>
              </div>
              <button
                type="button"
                className={styles.sendModalClose}
                aria-label="Cerrar"
                onClick={handleCloseSendModal}
              >
                <X size={18} />
              </button>
            </header>

            <div className={styles.sendComposer}>
              <label className={styles.sendLine}>
                <span>Para:</span>
                <input
                  type="text"
                  value={sendEmailForm.to}
                  onChange={(event) => updateSendEmailForm('to', event.target.value)}
                  placeholder="Escribe un email o usa el del contacto"
                />
                <button
                  type="button"
                  className={styles.copyToggle}
                  onClick={() => setShowCopyFields((visible) => !visible)}
                >
                  {showCopyFields ? 'Ocultar CC/BCC' : 'Mostrar CC/BCC'}
                </button>
              </label>

              {showCopyFields && (
                <>
                  <label className={styles.sendLine}>
                    <span>CC:</span>
                    <input
                      type="text"
                      value={sendEmailForm.cc}
                      onChange={(event) => updateSendEmailForm('cc', event.target.value)}
                      placeholder="Correos en copia"
                    />
                  </label>
                  <label className={styles.sendLine}>
                    <span>BCC:</span>
                    <input
                      type="text"
                      value={sendEmailForm.bcc}
                      onChange={(event) => updateSendEmailForm('bcc', event.target.value)}
                      placeholder="Correos en copia oculta"
                    />
                  </label>
                </>
              )}

              <label className={styles.sendLine}>
                <span>Asunto:</span>
                <input
                  type="text"
                  value={sendEmailForm.subject}
                  onChange={(event) => updateSendEmailForm('subject', event.target.value)}
                  placeholder="Asunto del correo"
                  required
                />
              </label>

              <textarea
                className={styles.sendMessage}
                value={sendEmailForm.message}
                onChange={(event) => updateSendEmailForm('message', event.target.value)}
                required
              />
            </div>

            <div className={styles.sendOptions}>
              <div>
                <strong>Archivos en el portal</strong>
                <span className={styles.documentPill}>{current.docNumber ?? config.singularTitle}</span>
              </div>
              <div>
                <strong>Plantilla</strong>
                <select defaultValue="default">
                  <option value="default">Plantilla predeterminada</option>
                </select>
              </div>
            </div>

            {sendEmailError && (
              <p className={styles.sendError}>
                {sendEmailError instanceof Error
                  ? sendEmailError.message
                  : 'No se pudo enviar el documento.'}
              </p>
            )}

            <footer className={styles.sendModalFooter}>
              <button type="button" onClick={handleCloseSendModal} disabled={isSendingDocumentEmail}>
                Cancelar
              </button>
              <Button
                type="submit"
                size="medium"
                icon={<Send size={16} />}
                loading={isSendingDocumentEmail}
              >
                Enviar
              </Button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
};
