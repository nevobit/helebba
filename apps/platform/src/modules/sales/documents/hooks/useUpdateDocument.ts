import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDocument } from '../services';
import type { CreateDocumentPayload, DocumentKind } from '../types';

type UpdateDocumentVariables = {
  documentId: string;
  payload: CreateDocumentPayload;
};

export const useUpdateDocument = (kind: DocumentKind) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ documentId, payload }: UpdateDocumentVariables) =>
      updateDocument(kind, documentId, payload),
    onSuccess: (_document, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', kind] });
      queryClient.invalidateQueries({ queryKey: ['documents', kind, variables.documentId] });
    },
  });

  return {
    isUpdatingDocument: mutation.isPending,
    updateDocument: mutation.mutate,
    updateDocumentAsync: mutation.mutateAsync,
  };
};
