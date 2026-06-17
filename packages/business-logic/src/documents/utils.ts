import type { Document as SalesDocument } from '@hlb/contracts';

const toNumber = (value: unknown) => {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export const calculateDocumentTotals = (document: Partial<SalesDocument>) => {
  const lines = document.lines ?? [];
  const subtotal = lines.reduce((total, line) => {
    const units = toNumber(line.units || 1);
    const price = toNumber(line.price);
    const discount = toNumber(line.discount);
    return total + Math.max(price * units - discount, 0);
  }, 0);
  const tax = lines.reduce((total, line) => {
    const units = toNumber(line.units || 1);
    const price = toNumber(line.price);
    const discount = toNumber(line.discount);
    const taxRate = toNumber(line.tax);
    const taxableBase = Math.max(price * units - discount, 0);
    return total + taxableBase * (taxRate / 100);
  }, 0);
  const discount = toNumber(document.discount);
  const resolvedSubtotal = document.subtotal ?? subtotal;
  const resolvedTax = document.tax ?? tax;

  return {
    subtotal: resolvedSubtotal,
    tax: resolvedTax,
    discount,
    total: document.total ?? Math.max(resolvedSubtotal + resolvedTax - discount, 0),
  };
};

export const buildDocumentNumber = (docType: string) =>
  `${docType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
