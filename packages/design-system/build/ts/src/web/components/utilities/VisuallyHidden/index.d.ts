import * as React from "react";
type AsProp<C extends React.ElementType> = {
    as?: C;
};
type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);
type PolymorphicProps<C extends React.ElementType, P> = P & AsProp<C> & Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, P>>;
type VisuallyHiddenBaseProps = {
    style?: React.CSSProperties;
    children?: React.ReactNode;
};
export type VisuallyHiddenProps<C extends React.ElementType = "span"> = PolymorphicProps<C, VisuallyHiddenBaseProps>;
export declare const VisuallyHidden: <C extends React.ElementType = "span">({ as, style, ...rest }: VisuallyHiddenProps<C>) => React.JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map