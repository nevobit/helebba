import { useMutation, useQueryClient } from '@tanstack/react-query';
import { convertDocument } from '../services';
import type { DocumentKind } from '../types';

export const useConvertDocument = (kind: DocumentKind) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (documentId: string) => convertDocument(kind, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    convertDocument: mutation.mutate,
    isConvertingDocument: mutation.isPending,
  };
};
