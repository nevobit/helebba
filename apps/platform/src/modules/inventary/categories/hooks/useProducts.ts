import { useQuery } from '@tanstack/react-query';
import { categories, type CategoryListParams } from '../services';

export function useCategories(params: CategoryListParams) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['categories', params],
    queryFn: () => categories(params),
  });

  return {
    categories: data?.items ?? [],
    pageInfo: data?.pageInfo,
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
