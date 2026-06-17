import { useQuery } from '@tanstack/react-query';
import { services, type ServiceListParams } from '../services';

export function useServices(params: ServiceListParams) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['services', params],
    queryFn: () => services(params),
  });

  return {
    services: data?.items ?? [],
    pageInfo: data?.pageInfo,
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
