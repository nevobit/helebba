import * as React from 'react';
import { type FieldProps } from '../Field';
export type SearchableSelectValue = string | number;
export interface SearchableSelectOption {
    disabled?: boolean;
    label: React.ReactNode;
    searchText?: string;
    value: SearchableSelectValue;
}
export interface SearchableSelectProps extends Omit<FieldProps, 'children' | 'readOnly'> {
    clearable?: boolean;
    disabled?: boolean;
    emptyMessage?: string;
    icon?: React.ReactNode;
    name?: string;
    onValueChange?: (value: SearchableSelectValue | '', option?: SearchableSelectOption) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    prefix?: React.ReactNode;
    readOnly?: boolean;
    searchPlaceholder?: string;
    suffix?: React.ReactNode;
    value?: SearchableSelectValue | '';
    defaultValue?: SearchableSelectValue | '';
}
export declare const SearchableSelect: React.ForwardRefExoticComponent<SearchableSelectProps & React.RefAttributes<HTMLInputElement>>;
//# sourceMappingURL=index.d.ts.map