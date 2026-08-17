import { api } from '@/shared/api';
import type { Category, OffsetPaginatedResult, Params } from '@hlb/contracts';

export type CategoryListParams = Params<{
  scope?: string;
  parentId?: string | null;
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
      parentId: params.parentId === null ? 'root' : params.parentId,
    },
  });

  return data;
};

export const createCategory = async (payload: CreateCategoryPayload) => {
  const { data } = await api.post<Category>('/categories', payload);

  return data;
};

export const deleteCategory = async (categoryId: string) => {
  const { data } = await api.delete<boolean>(`/categories/${categoryId}`);
  return data;
};

export const updateCategory = async (categoryId: string, payload: CreateCategoryPayload) => {
  const { data } = await api.patch<Category>(`/categories/${categoryId}`, payload);
  return data;
};
