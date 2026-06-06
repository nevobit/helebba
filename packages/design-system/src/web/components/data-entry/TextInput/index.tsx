import * as React from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { Field, type FieldProps } from '../Field';
import styles from './TextInput.module.css';
import { cx } from '../../../../utils';

export interface TextInputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'id'>,
    Omit<FieldProps, 'children'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  togglePassword?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
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
      prefix,
      suffix,
      icon,
      clearable,
      onClear,
      togglePassword,
      type = 'text',
      disabled,
      readOnly,
      className,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const [revealed, setRevealed] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && togglePassword ? (revealed ? 'text' : 'password') : type;

    const showClear = clearable && !disabled && !readOnly && Boolean(value ?? defaultValue);

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
        disabled={disabled}
        readOnly={readOnly}
        fullWidth={fullWidth}
        size={size}
        className={className}
      >
        {({ controlId, describedBy, status, invalid }) => (
          <div
            className={cx(styles.field, styles[size])}
            data-status={status}
            data-has-leading={Boolean(icon || prefix)}
            data-has-trailing={Boolean(suffix || showClear || (isPassword && togglePassword))}
          >
            {(icon || prefix) && (
              <span className={styles.affix} aria-hidden="true">
                {icon ?? prefix}
              </span>
            )}

            <input
              {...props}
              id={controlId}
              ref={ref}
              type={inputType}
              className={styles.control}
              value={value}
              defaultValue={defaultValue}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />

            {isPassword && togglePassword && (
              <button
                type="button"
                className={styles.action}
                onClick={() => setRevealed((current) => !current)}
                disabled={disabled}
                aria-label={revealed ? 'Hide password' : 'Show password'}
              >
                {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            {showClear && (
              <button
                type="button"
                className={styles.action}
                onClick={onClear}
                disabled={disabled}
                aria-label="Clear input"
              >
                <X size={18} />
              </button>
            )}

            {suffix && (
              <span className={styles.affix} aria-hidden="true">
                {suffix}
              </span>
            )}
          </div>
        )}
      </Field>
    );
  },
);

TextInput.displayName = 'TextInput';
