import { useQuery } from '@tanstack/react-query';
import { warehouses, type WarehouseListParams } from '../services';

export function useWarehouses(params: WarehouseListParams) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['warehouses', params],
    queryFn: () => warehouses(params),
  });

  return {
    warehouses: data?.items ?? [],
    pageInfo: data?.pageInfo,
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
