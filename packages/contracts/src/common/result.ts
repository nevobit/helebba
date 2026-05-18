export type Cursor = string & { readonly __brand: 'Cursor' };

export type OffsetPageInfo = {
  readonly kind: 'offset';
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly nextPage: number | null;
  readonly previousPage: number | null;
};

export type CursorPageInfo = {
  readonly kind: 'cursor';
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly startCursor: Cursor | null;
  readonly endCursor: Cursor | null;
};

export type PageInfo = OffsetPageInfo | CursorPageInfo;

export interface Edge<T> {
  readonly cursor: Cursor;
  readonly node: T;
}

export interface OffsetPaginatedResult<T> {
  readonly kind: 'offset';
  readonly items: readonly T[];
  readonly pageInfo: OffsetPageInfo;
}

export interface CursorPaginatedResult<T> {
  readonly kind: 'cursor';
  readonly edges: readonly Edge<T>[];
  readonly pageInfo: CursorPageInfo;
}

export type PaginatedResult<T> = OffsetPaginatedResult<T> | CursorPaginatedResult<T>;

export type OffsetPaginationArgs = {
  readonly kind: 'offset';
  readonly page: number;
  readonly pageSize: number;
};

export type ForwardCursorPaginationArgs = {
  readonly kind: 'cursor';
  readonly first: number;
  readonly after?: Cursor;
};

export type BackwardCursorPaginationArgs = {
  readonly kind: 'cursor';
  readonly last: number;
  readonly before?: Cursor;
};

export type PaginationArgs =
  | OffsetPaginationArgs
  | ForwardCursorPaginationArgs
  | BackwardCursorPaginationArgs;
