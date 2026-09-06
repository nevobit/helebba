import {
  StatusDocument,
  type Document as SalesDocument,
  type DocumentId,
  type DocumentType,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';
import { createDocument } from './create';
import { getDocumentById } from './get-by-id';

type ConvertDocumentParams = {
  documentId: DocumentId;
  organizationId: OrganizationId;
  targetDocType: DocumentType;
  userId: UserId;
};

export const convertDocument = async ({
  documentId,
  organizationId,
  targetDocType,
  userId,
}: ConvertDocumentParams): Promise<SalesDocument> => {
  const source = await getDocumentById(documentId, organizationId);

  if (!source) throw new Error('Document not found');

  return createDocument(
    {
      contactId: source.contactId,
      contactName: source.contactName,
      description: source.description,
      date: source.date,
      dueDate: source.dueDate,
      subtotal: source.subtotal,
      discount: source.discount,
      total: source.total,
      tax: source.tax,
      currency: source.currency,
      status: StatusDocument.Pending,
      tags: source.tags,
      lines: source.lines,
      paymentMethodId: source.paymentMethodId,
      paymentsTotal: 0,
      paymentsPending: source.total,
      language: source.language,
      designId: source.designId,
      customFields: [
        ...(source.customFields ?? []),
        { field: 'sourceDocumentId', value: String(source.id) },
        { field: 'sourceDocumentType', value: String(source.docType) },
      ],
      organizationId,
      createdBy: userId,
      updatedBy: userId,
    },
    targetDocType,
  );
};
