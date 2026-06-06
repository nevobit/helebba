import * as React from "react";

type AsProp<C extends React.ElementType> = {
    as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicProps<C extends React.ElementType, P> =
    P &
    AsProp<C> &
    Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, P>>;

type VisuallyHiddenBaseProps = {
    style?: React.CSSProperties;
    children?: React.ReactNode;
};

export type VisuallyHiddenProps<C extends React.ElementType = "span"> =
    PolymorphicProps<C, VisuallyHiddenBaseProps>;

export const VisuallyHidden = <C extends React.ElementType = "span">(
    { as, style, ...rest }: VisuallyHiddenProps<C>
) => {
    const Component = (as ?? "span") as React.ElementType;

    return (
        <Component
            {...rest}
            style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
                whiteSpace: "nowrap",
                border: 0,
                ...style,
            }}
        />
    );
};
