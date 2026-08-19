import * as React from 'react';
export declare const BUTTON_VARIANTS: readonly ["solid", "outline", "ghost", "plain"];
export declare const BUTTON_TONES: readonly ["neutral", "success", "critical"];
export declare const BUTTON_THEMES: readonly ["default", "monochrome", "optional"];
export declare const BUTTON_SIZES: readonly ["micro", "slim", "medium", "large"];
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonTone = (typeof BUTTON_TONES)[number];
export type ButtonTheme = (typeof BUTTON_THEMES)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type ButtonIconPosition = 'left' | 'right';
export type ButtonDisclosure = 'down' | 'up' | 'select' | boolean;
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
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
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=index.d.ts.map