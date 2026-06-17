import { useQuery } from '@tanstack/react-query';
import { document } from '../services';
import type { DocumentKind } from '../types';

export function useDocument(kind: DocumentKind, documentId?: string | null) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['documents', kind, documentId],
    queryFn: () => document(kind, documentId as string),
    enabled: Boolean(documentId),
  });

  return {
    document: data,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
