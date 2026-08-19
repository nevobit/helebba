import * as React from 'react';
import { type TextInputProps } from '../TextInput';
export interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'defaultValue' | 'onChange' | 'type' | 'prefix'> {
    value?: number;
    defaultValue?: number;
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    onValueChange?: (value: number | null) => void;
}
export declare const CurrencyInput: React.ForwardRefExoticComponent<CurrencyInputProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=index.d.ts.map