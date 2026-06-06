import * as React from 'react';
import { TextInput, type TextInputProps } from '../TextInput';

export interface CurrencyInputProps extends Omit<
  TextInputProps,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'prefix'
> {
  value?: number;
  defaultValue?: number;
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  onValueChange?: (value: number | null) => void;
}

const formatCurrency = (
  value: number,
  locale: string,
  currency: string,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

const parseCurrency = (value: string): number | null => {
  const normalized = value.replace(/[^\d.-]/g, '');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isNaN(parsed) ? null : parsed;
};
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      defaultValue,
      currency = 'COP',
      locale = 'es-CO',
      minimumFractionDigits = 0,
      maximumFractionDigits = 2,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = React.useState('');

    React.useEffect(() => {
      if (value == null) {
        setDisplayValue('');
        return;
      }

      setDisplayValue(
        formatCurrency(value, locale, currency, minimumFractionDigits, maximumFractionDigits),
      );
    }, [value, currency, locale, minimumFractionDigits, maximumFractionDigits]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = (event.target as any).value as string;

      const numericValue = parseCurrency(raw);

      onValueChange?.(numericValue);

      setDisplayValue(raw);
    };

    const handleBlur = () => {
      const numericValue = parseCurrency(displayValue);

      if (numericValue == null) {
        setDisplayValue('');
        return;
      }

      setDisplayValue(
        formatCurrency(
          numericValue,
          locale,
          currency,
          minimumFractionDigits,
          maximumFractionDigits,
        ),
      );
    };

    return (
      <TextInput
        {...props}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';
