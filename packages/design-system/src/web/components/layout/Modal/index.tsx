import * as React from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

type ModalContextType = {
    openModal: (node: React.ReactNode, opts?: { id?: string }) => void;
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

const ModalContext = React.createContext<ModalContextType | null>(null);

function useModal() {
    const ctx = React.useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used within <Modal /> (provider)");
    return ctx;
}


type ProviderProps = {
    children: React.ReactNode;
    portalRootId?: string;
};

type StackItem = { id: string; node: React.ReactNode };

function Provider({ children, portalRootId = "ds-portal-root" }: ProviderProps) {
    const [stack, setStack] = React.useState<StackItem[]>([]);
    const [confirmNode, setConfirmNode] = React.useState<React.ReactNode | null>(null);

    React.useEffect(() => {
        let root = document.getElementById(portalRootId);
        if (!root) {
            root = document.createElement("div");
            root.id = portalRootId;
            document.body.appendChild(root);
        }
    }, [portalRootId]);

    React.useEffect(() => {
        const hasAny = stack.length > 0 || !!confirmNode;
        if (!hasAny) return;

        // const originalOverflow = document.body.style.overflow;
        // const originalPaddingRight = document.body.style.paddingRight;
        const scrollBarW = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        if (scrollBarW > 0) document.body.style.paddingRight = `${scrollBarW}px`;

        const siblings = Array.from(document.body.children);
        const restored: Array<{ el: Element; ariaHidden?: string | null; inert?: boolean }> = [];

        siblings.forEach((el) => {
            if ((el as HTMLElement).dataset?.modalLayer === "true") return;
            if (el.id === "ds-portal-root") return;

            if (el.contains(document.activeElement)) return;

            restored.push({
                el,
                ariaHidden: el.getAttribute("aria-hidden"),
                inert: (el as unknown as HTMLElement).inert ?? false,
            });

            try {
                (el as unknown as HTMLElement).inert = true;
            } catch {
                el.setAttribute("aria-hidden", "true");
            }
        });

        return () => {
            restored.forEach(({ el, ariaHidden, inert }) => {
                if (ariaHidden == null) el.removeAttribute("aria-hidden");
                else el.setAttribute("aria-hidden", ariaHidden);
                try {
                    (el as unknown as HTMLElement).inert = inert ?? false;
                } catch {
                    return null;
                }
            });
        };

    }, [stack.length, confirmNode]);

    const openModal = React.useCallback((node: React.ReactNode, opts?: { id?: string }) => {
        setStack((prev) => [...prev, { id: opts?.id ?? crypto.randomUUID(), node }]);
    }, []);

    const closeModal = React.useCallback(() => {
        setStack((prev) => prev.slice(0, -1));
    }, []);

    const requestCloseModal = React.useCallback<ModalContextType["requestCloseModal"]>(
        ({
            confirm = false,
            onConfirm,
            title = "Discard changes",
            description = "All unsaved changes will be lost. Do you want to proceed?",
            confirmLabel = "Confirm",
            cancelLabel = "Cancel",
        }) => {
            if (!confirm) {
                onConfirm();
                closeModal();
                return;
            }
            setConfirmNode(
                <Window
                    isOpen
                    onClose={() => setConfirmNode(null)}
                    size="sm"
                    ariaLabel={typeof title === "string" ? title : "Confirmation"}
                >
                    <Header>
                        <h2 className={styles.confirmTitle}>{title}</h2>
                    </Header>
                    <Body>
                        <p className={styles.confirmCopy}>{description}</p>
                    </Body>
                    <Footer className={styles.confirmFooter}>
                        <button className={styles.btn} type="button" onClick={() => setConfirmNode(null)}>
                            {cancelLabel}
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnCritical}`}
                            type="button"
                            onClick={() => {
                                onConfirm();
                                closeModal();
                                setConfirmNode(null);
                            }}
                        >
                            {confirmLabel}
                        </button>
                    </Footer>
                </Window>
            );
        },
        [closeModal]
    );

    const ctx: ModalContextType = { openModal, closeModal, requestCloseModal, stackDepth: stack.length };

    return (
        <ModalContext.Provider value={ctx}>
            {children}
            {stack.map((item, i) => (
                <Layer key={item.id} zIndexBase={1000 + i * 2}>
                    {item.node}
                </Layer>
            ))}
            {confirmNode && <Layer zIndexBase={1000 + stack.length * 2 + 10}>{confirmNode}</Layer>}
        </ModalContext.Provider>
    );
}

function Layer({ children, zIndexBase }: { children: React.ReactNode; zIndexBase: number }) {
    const [mounted, setMounted] = React.useState(false);
    const hostRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        const host = document.createElement("div");
        host.style.position = "relative";
        host.style.zIndex = `${zIndexBase}`;
        host.setAttribute("data-modal-layer", "true");
        hostRef.current = host;
        document.body.appendChild(host);
        setMounted(true);
        return () => host.remove();
    }, [zIndexBase]);

    if (!mounted || !hostRef.current) return null;
    return createPortal(children, hostRef.current);
}


function useFocusTrap(
    isOpen: boolean,
    containerRef: React.RefObject<HTMLElement>,
    autoFocusRef?: React.RefObject<HTMLElement>
) {
    React.useEffect(() => {
        if (!isOpen || !containerRef.current) return;
        const container = containerRef.current;
        const prev = document.activeElement as HTMLElement | null;

        const focusables = () =>
            Array.from(
                container.querySelectorAll<HTMLElement>(
                    "a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex='-1'])"
                )
            ).filter((el) => el.offsetParent !== null);

        const initial = autoFocusRef?.current ?? focusables()[0] ?? container;
        initial.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;
            const list = focusables();
            if (list.length === 0) {
                e.preventDefault();
                container.focus();
                return;
            }
            const first = list[0];
            const last = list[list.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (!e.shiftKey && active === last) {
                e.preventDefault();
                first?.focus();
            } else if (e.shiftKey && active === first) {
                e.preventDefault();
                last?.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            if (prev && prev.focus) prev.focus();
        };
    }, [isOpen, containerRef, autoFocusRef]);
}


type WindowProps = {
    isOpen: boolean;
    onClose: () => void;
    onRequestClose?: () => void;
    closeStrategy?: "auto" | "manual";
    children: React.ReactNode;
    className?: string;
    overlayClassName?: string;
    size?: "sm" | "md" | "lg" | "xl" | { width?: number | string; maxWidth?: number | string };
    closeOnOverlay?: boolean;
    closeOnEsc?: boolean;
    ariaLabel?: string;
    labelledById?: string;
    describedById?: string;
    initialFocusRef?: React.RefObject<HTMLElement>;
};

function Window({
    isOpen,
    onClose,
    onRequestClose,
    children,
    className,
    overlayClassName,
    size = "md",
    closeOnOverlay = true,
    closeOnEsc = true,
    closeStrategy = "auto",
    ariaLabel,
    labelledById,
    describedById,
    initialFocusRef,
}: WindowProps) {
    const overlayRef = React.useRef<HTMLDivElement>(null);
    const dialogRef = React.useRef<HTMLDivElement>(null);

    const [animState, setAnimState] = React.useState<"closed" | "open">("closed");
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setMounted(true);
            requestAnimationFrame(() => setAnimState("open"));
        } else {
            setAnimState("closed");
        }
    }, [isOpen]);

    const handleDialogTransitionEnd: React.TransitionEventHandler<HTMLDivElement> = (e) => {
        if (e.target !== dialogRef.current) return;
        if (animState === "closed" && mounted) {
            onClose();
            setMounted(false);
        }
    };

    useFocusTrap(isOpen, dialogRef as React.RefObject<HTMLElement>, initialFocusRef);

    React.useEffect(() => {
        if (!isOpen || !closeOnEsc) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (closeStrategy === "manual") {
                onRequestClose?.();
            } else {
                if (onRequestClose) {
                    onRequestClose();
                } else {
                    setAnimState("closed");
                }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen, closeOnEsc, closeStrategy, onRequestClose]);

    if (!mounted) return null;

    const sizeStyle =
        typeof size === "object"
            ? { width: size.width, maxWidth: size.maxWidth }
            : ({ sm: { maxWidth: 420 }, md: { maxWidth: 640 }, lg: { maxWidth: 960 }, xl: { maxWidth: 1200 } }[size]);

    const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (!closeOnOverlay) return;
        if (e.target === overlayRef.current) {
            if (closeStrategy === "manual") {
                onRequestClose?.();
            } else {
                if (onRequestClose) {
                    onRequestClose();
                } else {
                    setAnimState("closed");
                }

            }
        }
    };

    return (
        <>
            <div
                ref={overlayRef}
                className={`${styles.overlay} ${overlayClassName ?? ""}`}
                data-state={animState}
                onClick={handleOverlayClick}
            />
            <div
                ref={dialogRef}
                className={`${styles.modal} ${className ?? ""}`}
                style={sizeStyle}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
                aria-labelledby={labelledById}
                aria-describedby={describedById}
                tabIndex={-1}
                data-state={animState}
                onMouseDown={(e) => e.stopPropagation()}
                onTransitionEnd={handleDialogTransitionEnd}
            >
                {children}
            </div>
        </>
    );
}


function Header({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`${styles.header} ${className ?? ""}`}>{children}</div>;
}
function Body({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`${styles.body} ${className ?? ""}`}>{children}</div>;
}
function Footer({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`${styles.footer} ${className ?? ""}`}>{children}</div>;
}

function CloseButton({
    onClick,
    label = "Close",
    className,
}: {
    onClick?: () => void;
    label?: string;
    className?: string;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            className={`${styles.closeBtn} ${className ?? ""}`}
            onClick={onClick}
        >
            ✕
        </button>
    );
}

interface ModalCompound extends React.FC<ProviderProps> {
    Window: typeof Window;
    Header: typeof Header;
    Body: typeof Body;
    Footer: typeof Footer;
    CloseButton: typeof CloseButton;
}

const Modal = Object.assign(Provider, {
    Window,
    Header,
    Body,
    Footer,
    CloseButton,
}) as ModalCompound;

export { Modal, useModal };
