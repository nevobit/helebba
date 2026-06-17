import { useQuery } from '@tanstack/react-query';
import { products, type ProductListParams } from '../services';

export function useProducts(params: ProductListParams) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['products', params],
    queryFn: () => products(params),
  });

  return {
    products: data?.items ?? [],
    pageInfo: data?.pageInfo,
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
