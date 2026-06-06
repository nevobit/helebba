type ClassValue = string | number | null | undefined | false | Record<string, boolean> | ClassValue[];

export const cx = (...args: ClassValue[]): string => {
    const out: string[] = [];
    const push = (v: ClassValue) => {
        if (!v) return;
        if (typeof v === "string" || typeof v === "number") out.push(String(v));
        else if (Array.isArray(v)) v.forEach(push);
        else if (typeof v === "object") Object.entries(v).forEach(([k, val]) => val && out.push(k));
    };
    args.forEach(push);
    return Array.from(new Set(out)).join(" ");
};
