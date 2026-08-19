import * as React from "react";
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
export declare const Avatar: React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=index.d.ts.map