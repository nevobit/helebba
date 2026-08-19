import * as React from 'react';
import { type FieldProps } from '../Field';
export interface SelectOption {
    disabled?: boolean;
    label: React.ReactNode;
    value: string | number;
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'id' | 'prefix'>, Omit<FieldProps, 'children' | 'readOnly'> {
    icon?: React.ReactNode;
    options?: SelectOption[];
    placeholder?: string;
    prefix?: React.ReactNode;
    readOnly?: boolean;
    suffix?: React.ReactNode;
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
//# sourceMappingURL=index.d.ts.map