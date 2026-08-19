import React from "react";
import { type SortDir } from "./logic";
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
    defaultSort?: {
        key: keyof T;
        dir: Exclude<SortDir, null>;
    };
    sort?: {
        key: keyof T | null;
        dir: SortDir;
    };
    onSortChange?: (sort: {
        key: keyof T | null;
        dir: SortDir;
    }) => void;
    pageSize?: number;
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    selectionMode?: RowSelectionMode;
    selectedKeys?: React.Key[];
    defaultSelectedKeys?: React.Key[];
    onSelectionChange?: (keys: React.Key[]) => void;
    getRowKey?: (row: T, index: number) => React.Key;
    activeRowKey?: React.Key | null;
    onRowClick?: (row: T, index: number) => void;
};
export declare function Table<T extends object>({ ariaLabel, columns, rows, zebra, stickyHeader, isLoading, loadingText, emptyText, defaultSort, sort, onSortChange, pageSize, page, defaultPage, onPageChange, selectionMode, selectedKeys, defaultSelectedKeys, onSelectionChange, getRowKey, activeRowKey, onRowClick }: DataTableProps<T>): React.JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map