import { api } from '@/shared/api';
import type { Category, OffsetPaginatedResult, Params } from '@hlb/contracts';

export type CategoryListParams = Params<{
  scope?: string;
}>;

export type CreateCategoryPayload = Partial<
  Pick<
    Category,
    | 'color'
    | 'description'
    | 'icon'
    | 'name'
    | 'options'
    | 'parentId'
    | 'position'
    | 'showInCatalog'
    | 'slug'
    | 'type'
  >
>;

export const categories = async (params: CategoryListParams) => {
  const { data } = await api.get<OffsetPaginatedResult<Category>>('/categories', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim() || undefined,
    },
  });

  return data;
};

export const createCategory = async (payload: CreateCategoryPayload) => {
  const { data } = await api.post<Category>('/categories', payload);

  return data;
};
