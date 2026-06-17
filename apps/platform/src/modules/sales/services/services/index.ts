import { api } from '@/shared/api';
import type { OffsetPaginatedResult, Params, Service } from '@hlb/contracts';

export type ServiceListParams = Params<{
  scope?: string;
}>;

export type CreateServicePayload = Partial<
  Pick<
    Service,
    | 'archived'
    | 'code'
    | 'color'
    | 'cost'
    | 'description'
    | 'duration'
    | 'name'
    | 'price'
    | 'salesChannelId'
    | 'tags'
    | 'tax'
    | 'timeInMinutes'
    | 'total'
  >
>;

export const services = async (params: ServiceListParams) => {
  const { data } = await api.get<OffsetPaginatedResult<Service>>('/services', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim() || undefined,
    },
  });

  return data;
};

export const createService = async (payload: CreateServicePayload) => {
  const { data } = await api.post<Service>('/services', payload);

  return data;
};
