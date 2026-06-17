import { api } from '@/shared/api';
import type { InventoryBrand, OffsetPaginatedResult, Params } from '@hlb/contracts';

export type BrandListParams = Params<{
  scope?: string;
}>;

export type CreateBrandPayload = Partial<
  Pick<InventoryBrand, 'color' | 'description' | 'logoUrl' | 'name' | 'parentId' | 'position' | 'slug' | 'website'>
>;

export const brands = async (params: BrandListParams) => {
  const { data } = await api.get<OffsetPaginatedResult<InventoryBrand>>('/brands', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim() || undefined,
    },
  });

  return data;
};

export const createBrand = async (payload: CreateBrandPayload) => {
  const { data } = await api.post<InventoryBrand>('/brands', payload);

  return data;
};
