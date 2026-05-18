export type DateFormatOptions = {
  locale?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  timeZone?: string;
};

export function formatDate(
  input: Date | number | string,
  {
    locale = 'es-CO',
    dateStyle = 'medium',
    timeStyle,
    timeZone = 'America/Bogota',
  }: DateFormatOptions = {},
): string {
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  const options: Intl.DateTimeFormatOptions = { dateStyle, timeZone };
  if (timeStyle) options.timeStyle = timeStyle;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatRelativeTime(
  from: Date | number,
  to: Date | number = Date.now(),
  locale = 'es',
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = (Number(from) - Number(to)) / 1000; // seconds
  const abs = Math.abs(diff);

  const table: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, sec] of table) {
    if (abs >= sec || unit === 'second') {
      const value = Math.round(diff / sec);
      return rtf.format(value, unit);
    }
  }
  return rtf.format(0, 'second');
}

export function toISOWithOffset(date: Date, offsetMinutes: number): string {
  const ms = date.getTime() - offsetMinutes * 60_000;
  return new Date(ms).toISOString();
}
