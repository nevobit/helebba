import type { Brand } from './brand';

export type ISODateTimeString = Brand<string, 'ISODateTimeString'>;

export function toISODateTimeString(value: Date | string): ISODateTimeString {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid date: ${String(value)}`);
  }

  return date.toISOString() as ISODateTimeString;
}

export function isISODateTimeString(value: string): value is ISODateTimeString {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString() === value;
}
