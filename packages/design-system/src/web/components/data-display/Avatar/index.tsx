import * as React from "react";
import styles from "./Avatar.module.css";
import { cx } from "../../../../utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    shape?: "circle" | "rounded";
    color?: string;
    badge?: React.ReactNode;
}

function getInitials(name?: string) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    const [a, b] = [parts[0], parts[1]];
    return (a?.[0] ?? "") + (b?.[0] ?? "");
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ src, alt = "", name, size = "md", shape = "circle", color = '--ds-color-neutral-300', badge, className, ...rest }, ref) => {
        const [errored, setErrored] = React.useState(false);
        const initials = getInitials(name).toUpperCase();

        return (
            <div
                ref={ref}
                className={cx(styles.root, styles[size], styles[shape], className)}
                style={{ backgroundColor: color || '--ds-color-neutral-300' }}
                {...rest}
            >
                {src && !errored ? (
                    <img
                        className={styles.img}
                        src={src}
                        alt={alt}
                        decoding="async"
                        loading="lazy"
                        onError={() => setErrored(true)}
                    />
                ) : initials ? (
                    <span className={styles.initials} aria-hidden={alt === "" ? "true" : undefined}>
                        {initials}
                    </span>
                ) : (
                    <span className={styles.placeholder} aria-hidden="true">👤</span>
                )}

                {badge ? <span className={styles.badge} aria-hidden="true">{badge}</span> : null}
            </div>
        );
    }
);

Avatar.displayName = "Avatar";
