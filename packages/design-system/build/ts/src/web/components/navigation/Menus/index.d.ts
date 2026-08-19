import React from 'react';
type Placement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export interface MenusProps {
    children: React.ReactNode;
    defaultPlacement?: Placement;
}
export declare const Menus: React.FC<MenusProps> & {
    Menu: typeof Menu;
    Toggle: typeof Toggle;
    List: typeof List;
    Item: typeof Item;
    Divider: typeof Divider;
    Label: typeof Label;
};
/** ──────────────────────────────────────────────────────────
 *  Menu: simple wrapper (layout hook)
 *  ────────────────────────────────────────────────────────── */
declare const Menu: React.FC<{
    children: React.ReactNode;
}>;
/** ──────────────────────────────────────────────────────────
 *  Toggle (button): abre/cierra, calcula posición, gestiona aria
 *  ────────────────────────────────────────────────────────── */
interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    id: string;
    verticalIcon?: boolean;
    children?: React.ReactNode;
    __setLastToggleRef?: (el: HTMLElement | null) => void;
}
declare const Toggle: React.FC<ToggleProps>;
interface ListProps {
    id: string;
    children: React.ReactNode;
    placement?: Placement;
    maxHeight?: number;
}
declare const List: React.FC<ListProps>;
export interface ItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    id: string;
    inset?: boolean;
    danger?: boolean;
    closeOnSelect?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
}
declare const Item: React.FC<ItemProps>;
declare const Divider: React.FC;
declare const Label: React.FC<React.HTMLAttributes<HTMLDivElement>>;
export default Menus;
//# sourceMappingURL=index.d.ts.map