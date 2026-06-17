import { useQuery } from '@tanstack/react-query';
import { contacts, type ContactListParams } from '../services';

export function useContacts(params: ContactListParams) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contacts(params),
  });

  return {
    contacts: data?.items ?? [],
    pageInfo: data?.pageInfo,
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
