import { Collection, getMailer, getModel } from '@hlb/constant-definitions';
import {
  ContactSchemaMongo,
  DocumentSchemaMongo,
  DocumentType,
  LifecycleStatus,
  OrganizationSchemaMongo,
  type Contact,
  type Document as SalesDocument,
  type DocumentId,
  type Organization,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';
import { createDocumentPdf, getDocumentPdfFilename } from './pdf';

export type SendDocumentEmailInput = {
  bcc?: string | string[];
  cc?: string | string[];
  documentId: DocumentId;
  docType?: DocumentType;
  message?: string;
  organizationId: OrganizationId;
  subject?: string;
  to?: string | string[];
  userId?: UserId;
};

export type SendDocumentEmailResult = {
  bcc: string[];
  cc: string[];
  id: string;
  subject: string;
  to: string[];
};

const getDocumentLabel = (docType?: string) => {
  if (docType === DocumentType.ESTIMATE) return 'Presupuesto';
  if (docType === DocumentType.PURCHASE) return 'Factura de compra';
  return 'Factura';
};

const getDocumentPath = (docType?: string) => {
  if (docType === DocumentType.ESTIMATE) return '/sales/estimates';
  if (docType === DocumentType.PURCHASE) return '/purchases';
  return '/sales/invoices';
};

const getAppUrl = () =>
  (
    process.env.PUBLIC_APP_URL ??
    process.env.WEB_APP_URL ??
    process.env.FRONTEND_URL ??
    process.env.APP_URL ??
    'http://localhost:5174'
  ).replace(/\/$/, '');

const normalizeEmails = (value?: string | string[]) => {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap((item) => item.split(/[,\n;]/))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const assertValidEmails = (emails: string[], field: string) => {
  const invalid = emails.find((email) => !email.includes('@'));

  if (invalid) {
    throw new Error(`Invalid ${field} email: ${invalid}`);
  }
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

const formatMoney = (value?: number, currency = 'COP') =>
  new Intl.NumberFormat('es-CO', {
    currency,
    style: 'currency',
  }).format(Number(value ?? 0));

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const toHtml = (message: string) =>
  escapeHtml(message)
    .split('\n\n')
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('');

const buildDefaultSubject = ({
  document,
  organizationName,
}: {
  document: SalesDocument;
  organizationName: string;
}) =>
  `${getDocumentLabel(document.docType)} ${document.docNumber ?? ''} de ${organizationName} para ${
    document.contactName || 'cliente'
  }`.trim();

const buildDefaultMessage = ({
  document,
  documentUrl,
  organizationName,
}: {
  document: SalesDocument;
  documentUrl: string;
  organizationName: string;
}) => {
  const label = getDocumentLabel(document.docType).toLowerCase();
  const lines = [
    `Hola ${document.contactName || 'cliente'},`,
    `Aquí tienes ${label} ${document.docNumber ?? ''} de ${organizationName}.`,
  ];

  if (document.dueDate) {
    lines.push(`El documento vence el ${formatDate(document.dueDate)}.`);
  }

  lines.push(`Total: ${formatMoney(document.total, document.currency || 'COP')}.`);
  lines.push(`Ver documento online: ${documentUrl}`);
  lines.push('Si tienes alguna duda, contacta con nosotros.');
  lines.push('Gracias,');
  lines.push(organizationName);

  return lines.join('\n\n');
};

export const sendDocumentEmail = async ({
  bcc,
  cc,
  documentId,
  docType,
  message,
  organizationId,
  subject,
  to,
}: SendDocumentEmailInput): Promise<SendDocumentEmailResult> => {
  const documentModel = getModel<SalesDocument>(Collection.DOCUMENTS, DocumentSchemaMongo);
  const contactModel = getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo);
  const organizationModel = getModel<Organization>(
    Collection.ORGANIZATIONS,
    OrganizationSchemaMongo,
  );

  const document = await documentModel.findOne({
    _id: documentId,
    ...(docType ? { docType } : {}),
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!document) {
    throw new Error('Document not found');
  }

  const [contact, organization] = await Promise.all([
    document.contactId
      ? contactModel.findOne({
          _id: document.contactId,
          organizationId,
          lifecycleStatus: LifecycleStatus.ACTIVE,
        })
      : null,
    organizationModel.findOne({
      _id: organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    }),
  ]);

  const recipients = normalizeEmails(to);

  if (recipients.length === 0 && contact?.email) {
    recipients.push(...normalizeEmails(contact.email));
  }

  const ccRecipients = normalizeEmails(cc);
  const bccRecipients = normalizeEmails(bcc);

  if (recipients.length === 0) {
    throw new Error('Recipient email is required');
  }

  assertValidEmails(recipients, 'recipient');
  assertValidEmails(ccRecipients, 'cc');
  assertValidEmails(bccRecipients, 'bcc');

  const organizationName = organization?.legalName || organization?.name || 'tu empresa';
  const documentUrl = `${getAppUrl()}${getDocumentPath(document.docType)}?documentId=${encodeURIComponent(
    String(document.id ?? documentId),
  )}`;
  const emailSubject =
    subject?.trim() ||
    buildDefaultSubject({
      document,
      organizationName,
    });
  const emailMessage =
    message?.trim() ||
    buildDefaultMessage({
      document,
      documentUrl,
      organizationName,
    });
  const mailer = getMailer();
  const pdf = createDocumentPdf(document, organizationName);
  const response = await mailer.send({
    to: recipients,
    ...(ccRecipients.length > 0 ? { cc: ccRecipients } : {}),
    ...(bccRecipients.length > 0 ? { bcc: bccRecipients } : {}),
    attachments: [
      {
        content: pdf,
        contentType: 'application/pdf',
        filename: getDocumentPdfFilename(document),
      },
    ],
    subject: emailSubject,
    text: emailMessage,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        ${toHtml(emailMessage)}
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <table style="border-collapse: collapse; width: 100%; max-width: 520px;">
          <tr>
            <td style="color: #6b7280; padding: 6px 0;">Documento</td>
            <td style="font-weight: 700; text-align: right; padding: 6px 0;">${escapeHtml(
              `${getDocumentLabel(document.docType)} ${document.docNumber ?? ''}`.trim(),
            )}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 6px 0;">Fecha</td>
            <td style="text-align: right; padding: 6px 0;">${escapeHtml(formatDate(document.date))}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 6px 0;">Vencimiento</td>
            <td style="text-align: right; padding: 6px 0;">${escapeHtml(formatDate(document.dueDate))}</td>
          </tr>
          <tr>
            <td style="color: #6b7280; padding: 6px 0;">Total</td>
            <td style="font-weight: 700; text-align: right; padding: 6px 0;">${escapeHtml(
              formatMoney(document.total, document.currency || 'COP'),
            )}</td>
          </tr>
        </table>
      </div>
    `,
    ...(organization?.email ? { replyTo: organization.email } : {}),
  });

  return {
    bcc: bccRecipients,
    cc: ccRecipients,
    id: response.id,
    subject: emailSubject,
    to: recipients,
  };
};
