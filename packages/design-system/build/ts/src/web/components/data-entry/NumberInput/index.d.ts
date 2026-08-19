import * as React from 'react';
import { type TextInputProps } from '../TextInput';
export interface NumberInputProps extends Omit<TextInputProps, 'type' | 'inputMode'> {
    min?: number;
    max?: number;
    step?: number;
}
export declare const NumberInput: React.ForwardRefExoticComponent<NumberInputProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=index.d.ts.map