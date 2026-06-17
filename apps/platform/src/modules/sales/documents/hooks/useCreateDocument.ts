import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDocument } from '../services';
import type { CreateDocumentPayload, DocumentKind } from '../types';

export const useCreateDocument = (kind: DocumentKind) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateDocumentPayload) => createDocument(kind, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', kind] });
    },
  });

  return {
    createDocument: mutation.mutate,
    createDocumentAsync: mutation.mutateAsync,
    isCreatingDocument: mutation.isPending,
  };
};
