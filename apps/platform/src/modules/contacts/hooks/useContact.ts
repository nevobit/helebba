import { useQuery } from '@tanstack/react-query';
import { getContact } from '../services';

export function useContact(contactId: string | undefined) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => getContact(String(contactId)),
    enabled: Boolean(contactId),
  });

  return {
    contact: data ?? null,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
