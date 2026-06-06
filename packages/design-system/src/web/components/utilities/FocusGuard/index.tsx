import { type KeyboardEvent, useEffect, useRef } from "react";

type Props = { active?: boolean };

export function FocusGuard({ active = true }: Props) {
    const startRef = useRef<HTMLSpanElement>(null);
    const endRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!active) return;
        startRef.current?.setAttribute("tabindex", "0");
        endRef.current?.setAttribute("tabindex", "0");
    }, [active]);

    const onKey = (e: KeyboardEvent<HTMLSpanElement>) => {
        if (!active || e.key !== "Tab") return;
        const focusables = Array.from(
            document.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
        ).filter(el => el.offsetParent !== null);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
        }
    };

    return (
        <>
            <span ref={startRef} onKeyDown={onKey} aria-hidden="true" />
            <span ref={endRef} onKeyDown={onKey} aria-hidden="true" />
        </>
    );
}
