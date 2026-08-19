import * as React from "react";
type ModalContextType = {
    openModal: (node: React.ReactNode, opts?: {
        id?: string;
    }) => void;
    closeModal: () => void;
    requestCloseModal: (args: {
        confirm?: boolean;
        onConfirm: () => void;
        title?: React.ReactNode;
        description?: React.ReactNode;
        confirmLabel?: string;
        cancelLabel?: string;
    }) => void;
    stackDepth: number;
};
declare function useModal(): ModalContextType;
type ProviderProps = {
    children: React.ReactNode;
    portalRootId?: string;
};
type WindowProps = {
    isOpen: boolean;
    onClose: () => void;
    onRequestClose?: () => void;
    closeStrategy?: "auto" | "manual";
    children: React.ReactNode;
    className?: string;
    overlayClassName?: string;
    size?: "sm" | "md" | "lg" | "xl" | {
        width?: number | string;
        maxWidth?: number | string;
    };
    closeOnOverlay?: boolean;
    closeOnEsc?: boolean;
    ariaLabel?: string;
    labelledById?: string;
    describedById?: string;
    initialFocusRef?: React.RefObject<HTMLElement>;
};
declare function Window({ isOpen, onClose, onRequestClose, children, className, overlayClassName, size, closeOnOverlay, closeOnEsc, closeStrategy, ariaLabel, labelledById, describedById, initialFocusRef, }: WindowProps): React.JSX.Element | null;
declare function Header({ children, className }: {
    children: React.ReactNode;
    className?: string;
}): React.JSX.Element;
declare function Body({ children, className }: {
    children: React.ReactNode;
    className?: string;
}): React.JSX.Element;
declare function Footer({ children, className }: {
    children: React.ReactNode;
    className?: string;
}): React.JSX.Element;
declare function CloseButton({ onClick, label, className, }: {
    onClick?: () => void;
    label?: string;
    className?: string;
}): React.JSX.Element;
interface ModalCompound extends React.FC<ProviderProps> {
    Window: typeof Window;
    Header: typeof Header;
    Body: typeof Body;
    Footer: typeof Footer;
    CloseButton: typeof CloseButton;
}
declare const Modal: ModalCompound;
export { Modal, useModal };
//# sourceMappingURL=index.d.ts.map