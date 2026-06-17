import { Buffer } from 'node:buffer';
import { DocumentType, type Document as SalesDocument } from '@hlb/contracts';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT = 56;

const getDocumentLabel = (docType?: string) => {
  if (docType === DocumentType.ESTIMATE) return 'Presupuesto';
  if (docType === DocumentType.PURCHASE) return 'Factura de compra';
  return 'Factura';
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

const ascii = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '?');

const escapePdfText = (value: unknown) =>
  ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const text = (x: number, y: number, size: number, value: unknown) =>
  `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET\n`;

const line = (x1: number, y1: number, x2: number, y2: number) =>
  `${x1} ${y1} m ${x2} ${y2} l S\n`;

const rect = (x: number, y: number, width: number, height: number) =>
  `${x} ${y} ${width} ${height} re S\n`;

const amountText = (value: unknown) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return formatMoney(0);

  return formatMoney(numeric);
};

const truncate = (value: unknown, max = 48) => {
  const normalized = ascii(value).trim();
  if (normalized.length <= max) return normalized;

  return `${normalized.slice(0, max - 1)}...`;
};

const buildContent = (document: SalesDocument, organizationName: string) => {
  const docLabel = getDocumentLabel(document.docType);
  const currency = document.currency || 'COP';
  const rows = document.lines?.slice(0, 14) ?? [];
  let y = 786;
  let content = '0.1 w\n';

  content += text(LEFT, y, 28, docLabel);
  content += text(392, y + 10, 11, 'Numero #');
  content += text(462, y + 10, 11, document.docNumber || '-');
  content += text(392, y - 10, 11, 'Fecha');
  content += text(462, y - 10, 11, formatDate(document.date));
  content += text(392, y - 30, 11, 'Vencimiento');
  content += text(462, y - 30, 11, formatDate(document.dueDate));

  y -= 86;
  content += text(LEFT, y, 13, organizationName);
  content += text(LEFT, y - 18, 10, 'Emisor');
  content += text(330, y, 13, document.contactName || 'Cliente');
  content += text(330, y - 18, 10, 'Cliente');

  y -= 72;
  content += line(LEFT, y, PAGE_WIDTH - LEFT, y);
  content += text(LEFT, y - 18, 9, 'CONCEPTO');
  content += text(300, y - 18, 9, 'PRECIO');
  content += text(380, y - 18, 9, 'UNIDADES');
  content += text(468, y - 18, 9, 'TOTAL');
  content += line(LEFT, y - 28, PAGE_WIDTH - LEFT, y - 28);
  y -= 52;

  if (rows.length === 0) {
    content += text(LEFT, y, 11, '-');
    content += text(300, y, 11, formatMoney(0, currency));
    content += text(395, y, 11, '0');
    content += text(468, y, 11, formatMoney(0, currency));
    y -= 24;
  } else {
    rows.forEach((row) => {
      const price = Number(row.price ?? 0);
      const units = Number(row.units ?? 0);
      const subtotal = price * units;
      const tax = subtotal * (Number(row.tax ?? 0) / 100);

      content += text(LEFT, y, 10, truncate(row.concept || row.description || '-', 36));
      content += text(300, y, 10, formatMoney(price, currency));
      content += text(395, y, 10, units);
      content += text(468, y, 10, formatMoney(subtotal + tax, currency));
      y -= 22;
    });
  }

  if ((document.lines?.length ?? 0) > rows.length) {
    content += text(LEFT, y, 9, `+ ${(document.lines?.length ?? 0) - rows.length} lineas adicionales`);
    y -= 22;
  }

  y = Math.max(y - 18, 186);
  content += line(330, y + 20, PAGE_WIDTH - LEFT, y + 20);
  content += text(330, y, 11, 'Base imponible');
  content += text(450, y, 11, amountText(document.subtotal));
  content += text(330, y - 22, 11, 'IVA');
  content += text(450, y - 22, 11, amountText(document.tax));
  content += text(330, y - 48, 13, 'TOTAL');
  content += text(450, y - 48, 13, formatMoney(document.total, currency));

  content += rect(LEFT, 58, PAGE_WIDTH - LEFT * 2, 58);
  content += text(LEFT + 14, 94, 10, 'Condiciones de pago');
  content += text(LEFT + 14, 76, 9, 'Pagar segun las condiciones acordadas con el emisor.');

  return content;
};

const buildPdf = (content: string) => {
  const stream = Buffer.from(content, 'ascii');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${content}endstream\nendobj\n`,
  ];
  const chunks = [Buffer.from('%PDF-1.4\n', 'ascii')];
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.concat(chunks).length);
    chunks.push(Buffer.from(object, 'ascii'));
  }

  const body = Buffer.concat(chunks);
  const xrefStart = body.length;
  const xref = [
    `xref\n0 ${objects.length + 1}\n`,
    '0000000000 65535 f \n',
    ...offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`,
  ].join('');

  return Buffer.concat([body, Buffer.from(xref, 'ascii')]);
};

export const createDocumentPdf = (document: SalesDocument, organizationName: string) =>
  buildPdf(buildContent(document, organizationName));

export const getDocumentPdfFilename = (document: SalesDocument) =>
  `${getDocumentLabel(document.docType).replace(/\s+/g, '-')}-${ascii(document.docNumber || document.id || 'documento')}.pdf`;
