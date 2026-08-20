import { api } from '@/shared/api';
import type { OffsetPaginatedResult, Params, PriceList } from '@hlb/contracts';

export type PriceListParams = Params<{ scope?: string }>;

export type CreatePriceListPayload = Partial<
  Pick<PriceList, 'name' | 'currency' | 'description'>
>;

export const priceLists = async (params: PriceListParams) => {
  const { data } = await api.get<OffsetPaginatedResult<PriceList>>('/price-lists', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim() || undefined,
    },
  });

  return data;
};

export const createPriceList = async (payload: CreatePriceListPayload) => {
  const { data } = await api.post<PriceList>('/price-lists', payload);

  return data;
};

export const updatePriceList = async (priceListId: string, payload: CreatePriceListPayload) => {
  const { data } = await api.patch<PriceList>(`/price-lists/${priceListId}`, payload);

  return data;
};