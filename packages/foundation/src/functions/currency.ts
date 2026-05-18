export type CurrencyFormatOptions = {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export function formatCurrency(
  value: number,
  {
    locale = 'es-CO',
    currency = 'COP',
    minimumFractionDigits,
    maximumFractionDigits,
  }: CurrencyFormatOptions = {},
): string {
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
  };
  if (minimumFractionDigits !== undefined) opts.minimumFractionDigits = minimumFractionDigits;
  if (maximumFractionDigits !== undefined) opts.maximumFractionDigits = maximumFractionDigits;
  return new Intl.NumberFormat(locale, opts).format(value);
}

export function parseCurrency(input: string, locale = 'es-CO'): number {
  const demo = 12345.6;
  const parts = new Intl.NumberFormat(locale).formatToParts(demo);
  const group = parts.find((p) => p.type === 'group')?.value ?? '.';
  const decimal = parts.find((p) => p.type === 'decimal')?.value ?? ',';
  const normalized = input
    .replace(new RegExp(`\\${group}`, 'g'), '')
    .replace(new RegExp(`\\${decimal}`), '.');
  const n = Number(normalized.replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}
