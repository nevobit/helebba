// FILE: src/components/tables/DataTable/logic.ts
export type SortDir = "asc" | "desc" | null;

export function sortRows<T>(rows: T[], key: keyof T, dir: SortDir): T[] {
    if (!dir) return rows;
    const mult = dir === "asc" ? 1 : -1;
    return [...rows].sort((a: T, b: T) => {
        const av = a[key], bv = b[key];
        if (av == null && bv == null) return 0;
        if (av == null) return -mult;
        if (bv == null) return mult;
        if (av < bv) return -1 * mult;
        if (av > bv) return 1 * mult;
        return 0;
    });
}

export function paginate<T>(rows: T[], page: number, pageSize: number) {
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const clamped = Math.min(Math.max(1, page), pages);
    const start = (clamped - 1) * pageSize;
    const slice = rows.slice(start, start + pageSize);
    return { slice, page: clamped, pages, total };
}
