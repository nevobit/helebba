import * as React from 'react';
import { AlertCircle, CheckCircle, LoaderCircle } from 'lucide-react';
import { cx } from '../../../../utils';
import { useId } from '../../../../hooks';
import { VisuallyHidden } from '../../utilities';
import styles from './Field.module.css';

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

export const Field = ({
  id,
  label,
  labelHidden = false,
  hint,
  error,
  success,
  loading = false,
  required = false,
  disabled = false,
  readOnly = false,
  size = 'md',
  fullWidth = false,
  children,
  className,
}: FieldProps) => {
  const controlId = useId(id);

  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const successId = success ? `${controlId}-success` : undefined;

  const status: FieldStatus = loading
    ? 'loading'
    : error
      ? 'error'
      : success
        ? 'success'
        : 'default';

  const describedBy =
    [errorId, !error && successId, !error && !success && hintId].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div
      className={cx(
        styles.root,
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        readOnly && styles.readOnly,
        className,
      )}
      data-status={status}
      data-size={size}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
    >
      {labelHidden ? (
        <VisuallyHidden as="label" htmlFor={controlId}>
          {label}
        </VisuallyHidden>
      ) : (
        <label className={styles.label} htmlFor={controlId}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children({
        controlId,
        describedBy,
        status,
        invalid: status === 'error' ? true : undefined,
      })}

      {error ? (
        <p id={errorId} className={cx(styles.message, styles.error)} role="alert">
          <AlertCircle size={14} />
          {error}
        </p>
      ) : success ? (
        <p
          id={successId}
          className={cx(styles.message, styles.success)}
          role="status"
          aria-live="polite"
        >
          <CheckCircle size={14} />
          {success}
        </p>
      ) : hint ? (
        <p id={hintId} className={cx(styles.message, styles.hint)}>
          {hint}
        </p>
      ) : loading ? (
        <p className={cx(styles.message, styles.loading)}>
          <LoaderCircle size={14} />
          Loading…
        </p>
      ) : null}
    </div>
  );
};
