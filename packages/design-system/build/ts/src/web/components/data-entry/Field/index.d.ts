import * as React from 'react';
export type FieldStatus = 'default' | 'error' | 'success' | 'loading';
export type FieldSize = 'sm' | 'md' | 'lg';
export interface FieldState {
    controlId: string;
    describedBy?: string;
    status: FieldStatus;
    invalid?: true;
}
export interface FieldProps {
    id?: string;
    label?: string;
    labelHidden?: boolean;
    hint?: string;
    error?: string;
    success?: string;
    loading?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    size?: FieldSize;
    fullWidth?: boolean;
    children: (state: FieldState) => React.ReactNode;
    className?: string;
}
export declare const Field: ({ id, label, labelHidden, hint, error, success, loading, required, disabled, readOnly, size, fullWidth, children, className, }: FieldProps) => React.JSX.Element;
//# sourceMappingURL=index.d.ts.map