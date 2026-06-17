import { useMutation } from '@tanstack/react-query';
import { sendDocumentEmail } from '../services';
import type { DocumentKind, SendDocumentEmailPayload } from '../types';

type SendDocumentEmailVariables = {
  documentId: string;
  payload: SendDocumentEmailPayload;
};

export const useSendDocumentEmail = (kind: DocumentKind) => {
  const mutation = useMutation({
    mutationFn: ({ documentId, payload }: SendDocumentEmailVariables) =>
      sendDocumentEmail(kind, documentId, payload),
  });

  return {
    error: mutation.error,
    isSendingDocumentEmail: mutation.isPending,
    sendDocumentEmail: mutation.mutateAsync,
  };
};
