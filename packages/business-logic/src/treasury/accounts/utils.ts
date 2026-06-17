import {
  LifecycleStatus,
  type OffsetPaginatedResult,
  type OffsetPageInfo,
} from '@hlb/contracts';

export const activeFilter = {
  lifecycleStatus: LifecycleStatus.ACTIVE,
};

export const toPageInfo = (page: number, limit: number, total: number): OffsetPageInfo => {
  const pages = Math.ceil(total / limit);

  return {
    page,
    pages,
    pageSize: limit,
    totalItems: total,
    hasPreviousPage: page > 1,
    hasNextPage: page < pages,
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < pages ? page + 1 : null,
  };
};

export const toOffsetResult = <T>(
  items: readonly T[],
  page: number,
  limit: number,
  total: number,
): OffsetPaginatedResult<T> => ({
  kind: 'offset',
  count: total,
  items,
  pageInfo: toPageInfo(page, limit, total),
});
