import * as React from 'react';
import { TextInput, type TextInputProps } from '../TextInput';

export interface NumberInputProps extends Omit<TextInputProps, 'type' | 'inputMode'> {
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ step = 1, ...props }, ref) => (
    <TextInput {...props} ref={ref} type="number" inputMode="decimal" step={step} />
  ),
);

NumberInput.displayName = 'NumberInput';
