import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDocument } from '../services';
import type { DocumentKind } from '../types';

export const useDeleteDocument = (kind: DocumentKind) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (documentId: string) => deleteDocument(kind, documentId),
    onSuccess: (_document, documentId) => {
      queryClient.invalidateQueries({ queryKey: ['documents', kind] });
      queryClient.invalidateQueries({ queryKey: ['documents', kind, documentId] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  return {
    deleteDocument: mutation.mutate,
    deleteDocumentAsync: mutation.mutateAsync,
    isDeletingDocument: mutation.isPending,
  };
};
