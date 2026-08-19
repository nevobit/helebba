import * as React from 'react';
import { type FieldProps } from '../Field';
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'id'>, Omit<FieldProps, 'children'> {
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    icon?: React.ReactNode;
    clearable?: boolean;
    onClear?: () => void;
    togglePassword?: boolean;
}
export declare const TextInput: React.ForwardRefExoticComponent<TextInputProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=index.d.ts.map