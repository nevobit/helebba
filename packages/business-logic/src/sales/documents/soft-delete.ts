import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  LifecycleStatus,
  PaymentSchemaMongo,
  type Document as SalesDocument,
  type DocumentId,
  type DocumentType,
  type OrganizationId,
  type Payment,
  type UserId,
} from '@hlb/contracts';

type SoftDeleteDocumentInput = {
  documentId: DocumentId;
  docType?: DocumentType;
  organizationId?: OrganizationId;
  userId?: UserId;
};

export const softDeleteDocument = async ({
  documentId,
  docType,
  organizationId,
  userId,
}: SoftDeleteDocumentInput) => {
  const documentModel = getModel<SalesDocument>(Collection.DOCUMENTS, DocumentSchemaMongo);
  const paymentModel = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const now = new Date();
  const filter = {
    _id: documentId,
    ...(docType ? { docType } : {}),
    ...(organizationId ? { organizationId } : {}),
    lifecycleStatus: LifecycleStatus.ACTIVE,
  };
  const result = await documentModel.updateOne(filter, {
    $set: {
      lifecycleStatus: LifecycleStatus.DELETED,
      deletedAt: now,
      deletedBy: userId,
      updatedAt: now,
      updatedBy: userId,
    },
  });

  if (!result.acknowledged || result.matchedCount < 1) throw new Error('Could not delete document');

  await paymentModel.updateMany(
    {
      documentId: String(documentId),
      ...(organizationId ? { organizationId } : {}),
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: now,
        deletedBy: userId,
        updatedAt: now,
        updatedBy: userId,
      },
    },
  );

  return documentModel.findOne({
    _id: documentId,
    ...(organizationId ? { organizationId } : {}),
  });
};
