import { useQuery } from '@tanstack/react-query';
import { organizations } from '../services';

export function useOrganizations() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizations,
  });

  return { organizations: data?.items ?? [], error, isLoading, refetch };
}
