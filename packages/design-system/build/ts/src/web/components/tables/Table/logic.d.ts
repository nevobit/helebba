export type SortDir = "asc" | "desc" | null;
export declare function sortRows<T>(rows: T[], key: keyof T, dir: SortDir): T[];
export declare function paginate<T>(rows: T[], page: number, pageSize: number): {
    slice: T[];
    page: number;
    pages: number;
    total: number;
};
//# sourceMappingURL=logic.d.ts.map