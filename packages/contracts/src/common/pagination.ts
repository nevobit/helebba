import type { OrganizationId } from '../models';

export type PaginationParams = {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
};

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;

  readonly totalItems: number;
  readonly totalPages: number;

  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly pagination: PaginationMeta;
}

export type QueryParams<TFilters extends object = Record<string, never>> = PaginationParams &
  TFilters;

export interface OrganizationParams {
  readonly organizationId: OrganizationId;
}
