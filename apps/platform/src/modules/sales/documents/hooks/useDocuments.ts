import { useQuery } from '@tanstack/react-query';
import { documents } from '../services';
import type { DocumentKind, DocumentListParams } from '../types';

export const documentsQueryKey = (kind: DocumentKind, params?: Partial<DocumentListParams>) => ['documents', kind, params];

export function useDocuments(kind: DocumentKind, params: DocumentListParams) {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: documentsQueryKey(kind, params),
    queryFn: () => documents(kind, params),
  });

  return {
    documents: data?.items ?? [],
    pageInfo: data?.pageInfo,
    total: data?.count ?? 0,
    error,
    isFetching,
    isLoading,
    refetch,
  };
}
