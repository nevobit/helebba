import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Field, type FieldProps } from '../Field';
import { cx } from '../../../../utils';
import styles from './Select.module.css';

export interface SelectOption {
  disabled?: boolean;
  label: React.ReactNode;
  value: string | number;
}

export interface SelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'id' | 'prefix'>,
    Omit<FieldProps, 'children' | 'readOnly'> {
  icon?: React.ReactNode;
  options?: SelectOption[];
  placeholder?: string;
  prefix?: React.ReactNode;
  readOnly?: boolean;
  suffix?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      labelHidden,
      hint,
      error,
      success,
      loading,
      required,
      fullWidth,
      size = 'md',
      icon,
      options,
      placeholder,
      prefix,
      suffix,
      disabled,
      readOnly,
      className,
      value,
      defaultValue,
      children,
      ...props
    },
    ref,
  ) => {
    const effectiveDisabled = disabled || readOnly;
    const selectedValue = value ?? defaultValue;
    const isPlaceholderSelected =
      placeholder && (selectedValue === undefined || selectedValue === null || selectedValue === '');

    return (
      <Field
        id={props.id}
        label={label}
        labelHidden={labelHidden}
        hint={hint}
        error={error}
        success={success}
        loading={loading}
        required={required}
        disabled={effectiveDisabled}
        readOnly={readOnly}
        fullWidth={fullWidth}
        size={size}
        className={className}
      >
        {({ controlId, describedBy, status, invalid }) => (
          <div className={cx(styles.field, styles[size])} data-status={status}>
            {(icon || prefix) && (
              <span className={styles.affix} aria-hidden="true">
                {icon ?? prefix}
              </span>
            )}

            <select
              {...props}
              id={controlId}
              ref={ref}
              className={styles.control}
              value={value}
              defaultValue={defaultValue}
              disabled={effectiveDisabled}
              required={required}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              aria-readonly={readOnly || undefined}
              data-placeholder={isPlaceholderSelected || undefined}
            >
              {placeholder && (
                <option value="" disabled={required}>
                  {placeholder}
                </option>
              )}
              {options?.map((option) => (
                <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
              {children}
            </select>

            {suffix && (
              <span className={styles.affix} aria-hidden="true">
                {suffix}
              </span>
            )}

            <span className={styles.indicator} aria-hidden="true">
              <ChevronDown size={16} strokeWidth="1.5px" />
            </span>
          </div>
        )}
      </Field>
    );
  },
);

Select.displayName = 'Select';
