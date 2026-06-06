import React, { useMemo, useState } from "react";
import styles from "./Table.module.css";
import { sortRows, paginate, type SortDir } from "./logic";
import { cx } from "../../../../utils";
type Align = "left" | "center" | "right";

export type DataTableColumn<T> = {
    key: keyof T;
    header: string;
    width?: number | string;
    align?: Align;
    sortable?: boolean;
    render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
    headerAriaLabel?: string;
};

export type RowSelectionMode = "none" | "single" | "multi";

export type DataTableProps<T extends object> = {
    ariaLabel?: string;
    columns: DataTableColumn<T>[];
    rows: T[];
    zebra?: boolean;
    stickyHeader?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    emptyText?: string;
    defaultSort?: { key: keyof T; dir: Exclude<SortDir, null> };
    sort?: { key: keyof T | null; dir: SortDir };
    onSortChange?: (sort: { key: keyof T | null; dir: SortDir }) => void;
    pageSize?: number;
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    selectionMode?: RowSelectionMode;
    selectedKeys?: React.Key[];
    defaultSelectedKeys?: React.Key[];
    onSelectionChange?: (keys: React.Key[]) => void;
    getRowKey?: (row: T, index: number) => React.Key;
};

export function Table<T extends object>({
    ariaLabel = "Data table",
    columns,
    rows,
    zebra = true,
    stickyHeader = false,
    isLoading = false,
    loadingText = "Loading…",
    emptyText = "Sin datos",
    defaultSort,
    sort,
    onSortChange,
    pageSize = 10,
    page,
    defaultPage = 1,
    onPageChange,
    selectionMode = "multi",
    selectedKeys,
    defaultSelectedKeys = [],
    onSelectionChange,
    getRowKey
}: DataTableProps<T>) {
    const [uSortKey, setUSortKey] = useState<keyof T | null>(defaultSort?.key ?? null);
    const [uSortDir, setUSortDir] = useState<SortDir>(defaultSort?.dir ?? null);
    const sortKey = sort ? sort.key : uSortKey;
    const sortDir = sort ? sort.dir : uSortDir;

    const toggleSort = (col: DataTableColumn<T>) => {
        if (!col.sortable) return;
        const nextKey: keyof T | null = col.key;
        let nextDir: SortDir;
        if (sortKey !== col.key) nextDir = "asc";
        else nextDir = sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc";

        if (onSortChange) onSortChange({ key: nextDir ? nextKey : null, dir: nextDir });
        else {
            setUSortKey(nextDir ? nextKey : null);
            setUSortDir(nextDir);
        }
    };

    const [uSelected, setUSelected] = useState<Set<React.Key>>(new Set(defaultSelectedKeys));
    const selected = selectedKeys ? new Set(selectedKeys) : uSelected;

    const setSelected = (next: Set<React.Key>) => {
        if (onSelectionChange) onSelectionChange(Array.from(next));
        else setUSelected(next);
    };

    const getKey = (row: T, i: number) => getRowKey?.(row, i) ?? i;

    const toggleRow = (k: React.Key) => {
        if (selectionMode === "none") return;
        const next = new Set(selected);
        if (selectionMode === "single") {
            next.clear();
            next.add(k);
        } else {
            if (next.has(k)) {
                next.delete(k);
        } else {
            next.add(k);
        }
        }
        setSelected(next);
    };

    const processedSorted = useMemo(() => {
        return sortKey && sortDir ? sortRows(rows, sortKey, sortDir) : rows;
    }, [rows, sortKey, sortDir]);

    const [uPage, setUPage] = useState(defaultPage);
    const currPage = page ?? uPage;
    const pg = useMemo(() => paginate(processedSorted, currPage, pageSize), [processedSorted, currPage, pageSize]);

    const setPage = (p: number) => {
        if (onPageChange) onPageChange(p);
        else setUPage(p);
    };



    const pageKeys = pg.slice.map(getKey);
    const pageAllSelected = pageKeys.every((k: React.Key) => selected.has(k));
    const pageSomeSelected = !pageAllSelected && pageKeys.some((k: React.Key) => selected.has(k));

    const onToggleAllPage = (checked: boolean) => {
        if (selectionMode === "none") return;
        const next = new Set(selected);
        if (checked) pageKeys.forEach(k => next.add(k));
        else pageKeys.forEach(k => next.delete(k));
        setSelected(next);
    };

    return (
        <div className={styles.wrap} role="table" aria-rowcount={rows.length} aria-label={ariaLabel}>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr className={stickyHeader ? styles.sticky : undefined}>
                        {selectionMode !== "none" && (
                            <th scope="col" className={styles.th} style={{ width: 36 }}>
                                <label className={styles.srOnly}>Select page rows</label>
                                <input
                                    className={styles.checkbox}
                                    type="checkbox"
                                    aria-checked={pageSomeSelected ? "mixed" : pageAllSelected}
                                    checked={pageAllSelected}
                                    onChange={(e) => onToggleAllPage(e.currentTarget.checked)}
                                />
                            </th>
                        )}
                        {columns.map((c) => {
                            const isSorted = sortKey === c.key;
                            const ariaSort = isSorted ? (sortDir ?? "none") : "none";
                            return (
                                <th
                                    key={String(c.key)}
                                    scope="col"
                                    className={styles.th}
                                    style={{ width: c.width, textAlign: c.align ?? "left" }}
                                    aria-sort={ariaSort as React.AriaAttributes["aria-sort"]}
                                >
                                    {c.sortable ? (
                                        <button
                                            className={styles.thBtn}
                                            onClick={() => toggleSort(c)}
                                            aria-label={c.headerAriaLabel ?? `Sort by ${c.header}`}
                                            title="Sort"
                                        >
                                            <span>{c.header}</span>
                                            <span className={styles.sortIcon}>
                                                {isSorted ? (sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : "–") : "↕"}
                                            </span>
                                        </button>
                                    ) : (
                                        <span>{c.header}</span>
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody>
                    {isLoading ? (
                        <tr>
                            <td className={styles.state} colSpan={columns.length + (selectionMode !== "none" ? 1 : 0)}>
                                {loadingText}
                            </td>
                        </tr>
                    ) : pg.slice.length === 0 ? (
                        <tr>
                            <td className={styles.state} colSpan={columns.length + (selectionMode !== "none" ? 1 : 0)}>
                                {emptyText}
                            </td>
                        </tr>
                    ) : (
                        pg.slice.map((row, i) => {
                            const k = getKey(row, i + (pg.page - 1) * pageSize);
                            const isSel = selected.has(k);
                            return (
                                <tr key={String(k)} className={cx(zebra && styles.zebra, styles.row)} role="row">
                                    {selectionMode !== "none" && (
                                        <td className={styles.td} style={{ width: 36 }}>
                                            <input
                                                className={styles.checkbox}
                                                type="checkbox"
                                                aria-label={`Select row ${i + 1}`}
                                                checked={isSel}
                                                onChange={() => toggleRow(k)}
                                            />
                                        </td>
                                    )}
                                    {columns.map((c) => (
                                        <td
                                            key={String(c.key)}
                                            className={styles.td}
                                            style={{ textAlign: c.align ?? "left" }}
                                        >
                                            {c.render ? c.render((row)[c.key], row, i) : String((row)[c.key] ?? "")}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            <div className={styles.footer}>
                <div className={styles.info}>
                    Page {pg.page} of {pg.pages} · {pg.total} rows
                </div>
                <div className={styles.controls} role="navigation" aria-label="Table pagination">
                    <button className={styles.pagBtn} onClick={() => setPage(1)} disabled={pg.page === 1}>« First</button>
                    <button className={styles.pagBtn} onClick={() => setPage(pg.page - 1)} disabled={pg.page === 1}>‹ Prev</button>
                    <button className={styles.pagBtn} onClick={() => setPage(pg.page + 1)} disabled={pg.page === pg.pages}>Next ›</button>
                    <button className={styles.pagBtn} onClick={() => setPage(pg.pages)} disabled={pg.page === pg.pages}>Last »</button>
                </div>
            </div> 
        </div>
    );
}
