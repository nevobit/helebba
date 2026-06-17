import { useQuery } from '@tanstack/react-query';
import { product } from '../services';

export function useProduct(productId?: string) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => product(productId!),
    enabled: Boolean(productId),
  });

  return {
    product: data,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
