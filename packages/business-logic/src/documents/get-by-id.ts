import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  type Document as SalesDocument,
  type DocumentId,
  type OrganizationId,
} from '@hlb/contracts';

export const getDocumentById = async (documentId: DocumentId, organizationId?: OrganizationId) => {
  const model = getModel<SalesDocument>(Collection.DOCUMENTS, DocumentSchemaMongo);
  const document = await model.findOne({
    _id: documentId,
    ...(organizationId ? { organizationId } : {}),
  });

  return document;
};
