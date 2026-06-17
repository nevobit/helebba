import { useQuery } from '@tanstack/react-query';
import { brands, type BrandListParams } from '../services';

export function useBrands(params: BrandListParams) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['brands', params],
    queryFn: () => brands(params),
  });

  return {
    brands: data?.items ?? [],
    pageInfo: data?.pageInfo,
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
