import * as React from 'react';
import styles from './Button.module.css';
import { cx } from '../../../../utils';
import { VisuallyHidden } from '../../utilities';

export const BUTTON_VARIANTS = ['solid', 'outline', 'ghost', 'plain'] as const;

export const BUTTON_TONES = ['neutral', 'success', 'critical'] as const;

export const BUTTON_THEMES = ['default', 'monochrome'] as const;

export const BUTTON_SIZES = ['micro', 'slim', 'medium', 'large'] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonTone = (typeof BUTTON_TONES)[number];
export type ButtonTheme = (typeof BUTTON_THEMES)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];

export type ButtonIconPosition = 'left' | 'right';
export type ButtonDisclosure = 'down' | 'up' | 'select' | boolean;

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'disabled'
> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  theme?: ButtonTheme;
  size?: ButtonSize;
  textAlign?: 'left' | 'right' | 'center' | 'start' | 'end';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: ButtonIconPosition;
  disclosure?: ButtonDisclosure;
  loadingLabel?: string;
}

const getDisclosureKind = (
  disclosure: ButtonDisclosure | undefined,
): 'down' | 'up' | 'select' | undefined => {
  if (disclosure === true) return 'down';
  if (disclosure === false) return undefined;

  return disclosure;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled = false,
      disclosure,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      loading = false,
      loadingLabel = 'Cargando…',
      onClick,
      size = 'medium',
      textAlign = 'center',
      theme = 'default',
      tone = 'neutral',
      type = 'button',
      variant = 'solid',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const disclosureKind = getDisclosureKind(disclosure);
    const hasOnlyIcon = Boolean(icon) && !children;

    if (process.env.NODE_ENV !== 'production') {
      if (hasOnlyIcon && !props['aria-label']) {
        console.warn('Button: icon-only buttons must include an aria-label.');
      }
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={cx(
          styles.button,
          styles[size],
          styles[variant],
          styles[`tone-${tone}`],
          styles[`theme-${theme}`],
          styles[`align-${textAlign}`],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          loading && styles.loading,
          hasOnlyIcon && styles.iconOnly,
          className,
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        data-variant={variant}
        data-tone={tone}
        data-theme={theme}
        data-size={size}
        data-loading={loading || undefined}
        data-full-width={fullWidth || undefined}
        onClick={handleClick}
      >
        {icon && iconPosition === 'left' && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}

        {children && <span className={styles.label}>{children}</span>}

        {loading && (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <VisuallyHidden>{loadingLabel}</VisuallyHidden>
          </>
        )}

        {icon && iconPosition === 'right' && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}

        {disclosureKind && (
          <span
            className={cx(styles.disclosure, styles[`disclosure--${disclosureKind}`])}
            aria-hidden="true"
          />
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
