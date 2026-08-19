import * as React from "react";
type TriggerProps = React.HTMLAttributes<HTMLElement>;
export interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement<TriggerProps>;
}
export declare const Tooltip: {
    ({ content, children }: TooltipProps): React.JSX.Element | null;
    displayName: string;
};
export {};
//# sourceMappingURL=index.d.ts.map