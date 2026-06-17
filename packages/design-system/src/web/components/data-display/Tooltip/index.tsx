import * as React from "react";
import styles from "./Tooltip.module.css";

type TriggerProps = React.HTMLAttributes<HTMLElement>;

export interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement<TriggerProps>;
}

export const Tooltip = ({ content, children }: TooltipProps) => {
    const [open, setOpen] = React.useState(false);
    const id = React.useId();

    if (!React.isValidElement<TriggerProps>(children)) return null;

    const handleMouseEnter: React.MouseEventHandler<HTMLElement> = (e) => {
        children.props.onMouseEnter?.(e);
        setOpen(true);
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLElement> = (e) => {
        children.props.onMouseLeave?.(e);
        setOpen(false);
    };

    const handleFocus: React.FocusEventHandler<HTMLElement> = (e) => {
        children.props.onFocus?.(e);
        setOpen(true);
    };

    const handleBlur: React.FocusEventHandler<HTMLElement> = (e) => {
        children.props.onBlur?.(e);
        setOpen(false);
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
        children.props.onKeyDown?.(e);
        if (e.key === "Escape") setOpen(false);
    };

    return (
        <span className={styles.wrapper}>
            {React.cloneElement(children, {
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
                onFocus: handleFocus,
                onBlur: handleBlur,
                onKeyDown: handleKeyDown,
                "aria-describedby": open ? id : undefined,
            })}
            {open && (
                <span role="tooltip" id={id} className={styles.tooltip}>
                    {content}
                </span>
            )}
        </span>
    );
};

Tooltip.displayName = "Tooltip";
