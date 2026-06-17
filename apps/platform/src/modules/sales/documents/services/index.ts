import { api } from '@/shared/api';
import type { Document, DocumentType } from '@hlb/contracts';
import { DOCUMENT_CONFIG } from '../config';
import type {
  CreateDocumentPayload,
  DocumentKind,
  DocumentListParams,
  DocumentsResponse,
  SendDocumentEmailPayload,
  SendDocumentEmailResponse,
} from '../types';

const endpointFor = (kind: DocumentKind) => DOCUMENT_CONFIG[kind].endpoint;

export const documents = async (kind: DocumentKind, params: DocumentListParams) => {
  const { data } = await api.get<DocumentsResponse>(endpointFor(kind), {
    params: {
      page: params.page,
      limit: params.limit,
      paymentMethodId: params.paymentMethodId || undefined,
      search: params.search?.trim() || undefined,
    },
  });

  return data;
};

export const document = async (kind: DocumentKind, documentId: string) => {
  const { data } = await api.get<Document>(`${endpointFor(kind)}/${documentId}`);

  return data;
};

export const createDocument = async (kind: DocumentKind, payload: CreateDocumentPayload) => {
  const { data } = await api.post<Document>(endpointFor(kind), payload);

  return data;
};

export const updateDocument = async (kind: DocumentKind, documentId: string, payload: CreateDocumentPayload) => {
  const { data } = await api.patch<Document>(`${endpointFor(kind)}/${documentId}`, payload);

  return data;
};

export const convertDocument = async (kind: DocumentKind, documentId: string, docType?: DocumentType) => {
  const { data } = await api.post<Document>(`${endpointFor(kind)}/${documentId}/convert`, docType ? { docType } : {});

  return data;
};

export const sendDocumentEmail = async (
  kind: DocumentKind,
  documentId: string,
  payload: SendDocumentEmailPayload,
) => {
  const { data } = await api.post<SendDocumentEmailResponse>(
    `${endpointFor(kind)}/${documentId}/send-email`,
    payload,
  );

  return data;
};
