import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  type Document as SalesDocument,
  type DocumentId,
  type OrganizationId,
} from '@hlb/contracts';
import { calculateDocumentTotals } from './utils';

export const updateDocument = async (
  documentId: DocumentId,
  data: Partial<SalesDocument>,
  organizationId?: OrganizationId,
) => {
  const model = getModel<SalesDocument>(Collection.DOCUMENTS, DocumentSchemaMongo);
  const shouldRecalculate = Boolean(data.lines || data.discount || data.subtotal || data.tax || data.total);
  const result = await model.updateOne(
    { _id: documentId, ...(organizationId ? { organizationId } : {}) },
    {
      $set: {
        ...data,
        ...(shouldRecalculate ? calculateDocumentTotals(data) : {}),
        updatedAt: new Date(),
      },
    },
  );

  if (!result.acknowledged || result.matchedCount < 1) throw new Error('Could not update document');

  const document = await model.findOne({ _id: documentId, ...(organizationId ? { organizationId } : {}) });

  return document;
};
