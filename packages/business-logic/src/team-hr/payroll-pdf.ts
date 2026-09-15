import { Buffer } from 'node:buffer';
import type { EmploymentContract, PayrollRecord } from '@hlb/contracts';

const ascii = (value: unknown) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\x20-\x7E]/g, '?');
const escapePdf = (value: unknown) => ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
const text = (x: number, y: number, size: number, value: unknown) => `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdf(value)}) Tj ET\n`;

const buildPdf = (lines: Array<{ value: unknown; size?: number }>) => {
  let y = 790;
  let content = '0.1 w\n';
  for (const line of lines) {
    content += text(56, y, line.size ?? 11, line.value);
    y -= (line.size ?? 11) + 10;
  }
  const stream = Buffer.from(content, 'ascii');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
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
  const xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${body.length}\n%%EOF\n`;
  return Buffer.concat([body, Buffer.from(xref, 'ascii')]);
};

export const createPayrollPdf = (record: PayrollRecord) => buildPdf([
  { value: 'Comprobante de nomina', size: 24 },
  { value: `Empleado: ${record.employeeId}` },
  { value: `Periodo: ${new Date(record.periodStart).toLocaleDateString('es-CO')} - ${new Date(record.periodEnd).toLocaleDateString('es-CO')}` },
  { value: `Salario bruto: ${record.grossSalary} ${record.currency}` },
  { value: `Deducciones: ${record.deductions} ${record.currency}` },
  { value: `Neto: ${record.netSalary} ${record.currency}`, size: 14 },
  { value: `Estado: ${record.status}` },
]);

export const createSalaryPdf = (contract: EmploymentContract) => buildPdf([
  { value: 'Certificado salarial', size: 24 },
  { value: `Empleado: ${contract.employeeId}` },
  { value: `Cargo: ${contract.position}` },
  { value: `Departamento: ${contract.department || '-'}` },
  { value: `Salario: ${contract.salary} ${contract.currency}`, size: 14 },
  { value: `Contrato vigente desde: ${new Date(contract.startDate).toLocaleDateString('es-CO')}` },
]);
