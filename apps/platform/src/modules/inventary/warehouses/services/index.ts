import { api } from '@/shared/api';
import type { OffsetPaginatedResult, Params, Warehouse } from '@hlb/contracts';

export type WarehouseListParams = Params<{
  scope?: string;
}>;

export type CreateWarehousePayload = Partial<
  Pick<
    Warehouse,
    | 'accountingAccount'
    | 'address'
    | 'color'
    | 'email'
    | 'icon'
    | 'isDefault'
    | 'mobile'
    | 'name'
    | 'phone'
    | 'postalCode'
    | 'productsCount'
    | 'totalStock'
  >
>;

export const warehouses = async (params: WarehouseListParams) => {
  const { data } = await api.get<OffsetPaginatedResult<Warehouse>>('/warehouses', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim() || undefined,
    },
  });

  return data;
};

export const createWarehouse = async (payload: CreateWarehousePayload) => {
  const { data } = await api.post<Warehouse>('/warehouses', payload);

  return data;
};
