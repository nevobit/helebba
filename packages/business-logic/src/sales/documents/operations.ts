import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentApprovalStatus,
  DocumentSchemaMongo,
  LifecycleStatus,
  OrganizationSchemaMongo,
  StatusDocument,
  type Document as SalesDocument,
  type DocumentAttachment,
  type DocumentFulfilledLine,
  type DocumentId,
  type DocumentTracking,
  type DocumentType,
  type OrganizationId,
  type Organization,
  type Payment,
  type UserId,
} from '@hlb/contracts';
import { createPayment } from '../../accounting/payments';
import { createDocumentPdf, getDocumentPdfFilename } from './pdf';
import { softDeleteDocument } from './soft-delete';

type DocumentScope = {
  documentId: DocumentId;
  docType: DocumentType;
  organizationId: OrganizationId;
};

const getDocumentModel = () =>
  getModel<SalesDocument>(Collection.DOCUMENTS, DocumentSchemaMongo);

const findDocument = async ({ documentId, docType, organizationId }: DocumentScope) => {
  const document = await getDocumentModel().findOne({
    _id: documentId,
    docType,
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!document) throw new Error('Document not found');
  return document;
};

const activeDocumentsFilter = (
  organizationId: OrganizationId,
  docType: DocumentType,
  documentIds?: DocumentId[],
) => ({
  organizationId,
  docType,
  lifecycleStatus: LifecycleStatus.ACTIVE,
  ...(documentIds ? { _id: { $in: documentIds } } : {}),
});

export const findDocumentByNumber = async ({
  docNumber,
  docType,
  organizationId,
}: Omit<DocumentScope, 'documentId'> & { docNumber: string }) => {
  const document = await getDocumentModel().findOne({
    ...activeDocumentsFilter(organizationId, docType),
    docNumber: docNumber.trim(),
  });
  if (!document) throw new Error('Document not found');
  return document;
};

export const bulkSetDocumentApprovalStatus = async ({
  documentIds,
  status,
  userId,
  docType,
  organizationId,
}: Omit<DocumentScope, 'documentId'> & {
  documentIds: DocumentId[];
  status: DocumentApprovalStatus;
  userId: UserId;
}) => {
  if (!documentIds.length) throw new Error('At least one documentId is required');
  const now = new Date().toISOString();
  const statusFields =
    status === DocumentApprovalStatus.APPROVED
      ? { approvedAt: now, approvedBy: userId }
      : status === DocumentApprovalStatus.ACCEPTED
        ? { acceptedAt: now, acceptedBy: userId }
        : status === DocumentApprovalStatus.REJECTED
          ? { rejectedAt: now, rejectedBy: userId }
          : {};
  const result = await getDocumentModel().updateMany(
    activeDocumentsFilter(organizationId, docType, documentIds),
    { $set: { approvalStatus: status, ...statusFields, updatedBy: userId } },
  );
  return { matched: result.matchedCount, updated: result.modifiedCount };
};

export const cancelDocument = async ({ userId, ...scope }: DocumentScope & { userId: UserId }) => {
  const document = await getDocumentModel().findOneAndUpdate(
    activeDocumentsFilter(scope.organizationId, scope.docType, [scope.documentId]),
    { $set: { status: StatusDocument.Cancelled, updatedBy: userId } },
    { new: true },
  );
  if (!document) throw new Error('Document not found');
  return document;
};

export const bulkCancelDocuments = async ({
  documentIds,
  userId,
  docType,
  organizationId,
}: Omit<DocumentScope, 'documentId'> & { documentIds: DocumentId[]; userId: UserId }) => {
  if (!documentIds.length) throw new Error('At least one documentId is required');
  const result = await getDocumentModel().updateMany(
    activeDocumentsFilter(organizationId, docType, documentIds),
    { $set: { status: StatusDocument.Cancelled, updatedBy: userId } },
  );
  return { matched: result.matchedCount, cancelled: result.modifiedCount };
};

export const bulkDeleteDocuments = async ({
  documentIds,
  userId,
  docType,
  organizationId,
}: Omit<DocumentScope, 'documentId'> & { documentIds: DocumentId[]; userId: UserId }) => {
  if (!documentIds.length) throw new Error('At least one documentId is required');
  const results = await Promise.allSettled(
    documentIds.map((documentId) =>
      softDeleteDocument({ documentId, docType, organizationId, userId }),
    ),
  );
  return {
    deleted: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  };
};

export const updateDocumentTracking = async ({
  tracking,
  userId,
  ...scope
}: DocumentScope & { tracking: DocumentTracking; userId: UserId }) => {
  const document = await getDocumentModel().findOneAndUpdate(
    activeDocumentsFilter(scope.organizationId, scope.docType, [scope.documentId]),
    { $set: { tracking, updatedBy: userId } },
    { new: true },
  );
  if (!document) throw new Error('Document not found');
  return document;
};

export const fulfillDocumentLines = async ({
  lines,
  warehouseId,
  userId,
  ...scope
}: DocumentScope & {
  lines?: Array<{ lineIndex: number; units?: number }>;
  warehouseId?: string;
  userId: UserId;
}) => {
  const document = await findDocument(scope);
  const requested = lines ?? document.lines.map((_line, lineIndex) => ({ lineIndex }));
  if (!requested.length) throw new Error('At least one line is required');
  const fulfilled = [...(document.fulfilledLines ?? [])];
  const fulfilledAt = new Date().toISOString() as DocumentFulfilledLine['fulfilledAt'];

  for (const requestedLine of requested) {
    const source = document.lines[requestedLine.lineIndex];
    if (!source) throw new Error(`Document line ${requestedLine.lineIndex} not found`);
    const totalUnits = Number(source.units ?? 0);
    const previousIndex = fulfilled.findIndex((line) => line.lineIndex === requestedLine.lineIndex);
    const alreadyFulfilled = previousIndex >= 0 ? fulfilled[previousIndex].units : 0;
    const units = requestedLine.units === undefined ? totalUnits : Number(requestedLine.units);
    if (!Number.isFinite(units) || units < 0 || units > totalUnits) {
      throw new Error(`Invalid units for document line ${requestedLine.lineIndex}`);
    }
    const nextUnits = lines ? Math.min(totalUnits, alreadyFulfilled + units) : totalUnits;
    const entry: DocumentFulfilledLine = {
      lineIndex: requestedLine.lineIndex,
      ...(source.productId ? { productId: source.productId } : {}),
      ...(source.variantId ? { variantId: source.variantId } : {}),
      ...(source.sku ? { sku: source.sku } : {}),
      units: nextUnits,
      fulfilledAt,
      ...(warehouseId ? { warehouseId } : {}),
    };
    if (previousIndex >= 0) fulfilled[previousIndex] = entry;
    else fulfilled.push(entry);
  }

  const updated = await getDocumentModel().findOneAndUpdate(
    activeDocumentsFilter(scope.organizationId, scope.docType, [scope.documentId]),
    { $set: { fulfilledLines: fulfilled, updatedBy: userId } },
    { new: true },
  );
  if (!updated) throw new Error('Document not found');
  return updated;
};

export const getDocumentFulfilledItems = async (scope: DocumentScope) =>
  (await findDocument(scope)).fulfilledLines ?? [];

export const attachDocumentFile = async ({
  attachment,
  userId,
  ...scope
}: DocumentScope & {
  attachment: Pick<DocumentAttachment, 'name' | 'url' | 'contentType' | 'size'>;
  userId: UserId;
}) => {
  if (!attachment?.name?.trim() || !attachment?.url?.trim()) {
    throw new Error('Attachment name and URL are required');
  }

  const item: DocumentAttachment = {
    id: randomUUID(),
    name: attachment.name.trim(),
    url: attachment.url.trim(),
    ...(attachment.contentType ? { contentType: attachment.contentType } : {}),
    ...(attachment.size === undefined ? {} : { size: attachment.size }),
    createdAt: new Date().toISOString() as DocumentAttachment['createdAt'],
    createdBy: userId,
  };
  const document = await getDocumentModel().findOneAndUpdate(
    {
      _id: scope.documentId,
      docType: scope.docType,
      organizationId: scope.organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
    { $push: { attachments: item }, $set: { updatedBy: userId } },
    { new: true },
  );

  if (!document) throw new Error('Document not found');
  return item;
};

export const listDocumentAttachments = async (scope: DocumentScope) =>
  (await findDocument(scope)).attachments ?? [];

export const getDocumentAttachment = async ({
  attachmentId,
  ...scope
}: DocumentScope & { attachmentId: string }) => {
  const attachment = (await listDocumentAttachments(scope)).find(
    (item) => item.id === attachmentId,
  );
  if (!attachment) throw new Error('Attachment not found');
  return attachment;
};

export const deleteDocumentAttachment = async ({
  attachmentId,
  userId,
  ...scope
}: DocumentScope & { attachmentId: string; userId: UserId }) => {
  await getDocumentAttachment({ attachmentId, ...scope });
  const document = await getDocumentModel().findOneAndUpdate(
    {
      _id: scope.documentId,
      docType: scope.docType,
      organizationId: scope.organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
    { $pull: { attachments: { id: attachmentId } }, $set: { updatedBy: userId } },
    { new: true },
  );

  if (!document) throw new Error('Document not found');
  return { attachmentId, deleted: true };
};

export const setDocumentApprovalStatus = async ({
  status,
  userId,
  ...scope
}: DocumentScope & { status: DocumentApprovalStatus; userId: UserId }) => {
  const now = new Date().toISOString();
  const statusFields: Record<string, string> = {};
  if (status === DocumentApprovalStatus.APPROVED) {
    statusFields.approvedAt = now;
    statusFields.approvedBy = userId;
  } else if (status === DocumentApprovalStatus.ACCEPTED) {
    statusFields.acceptedAt = now;
    statusFields.acceptedBy = userId;
  } else if (status === DocumentApprovalStatus.REJECTED) {
    statusFields.rejectedAt = now;
    statusFields.rejectedBy = userId;
  }

  return getDocumentModel().findOneAndUpdate(
    {
      _id: scope.documentId,
      docType: scope.docType,
      organizationId: scope.organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
    { $set: { approvalStatus: status, ...statusFields, updatedBy: userId } },
    { new: true },
  );
};

export const setDocumentPipeline = async ({
  pipelineId,
  pipelineStageId,
  userId,
  ...scope
}: DocumentScope & {
  pipelineId: string;
  pipelineStageId?: string;
  userId: UserId;
}) => {
  if (!pipelineId?.trim()) throw new Error('pipelineId is required');
  const document = await getDocumentModel().findOneAndUpdate(
    {
      _id: scope.documentId,
      docType: scope.docType,
      organizationId: scope.organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
    {
      $set: {
        pipelineId: pipelineId.trim(),
        ...(pipelineStageId === undefined ? {} : { pipelineStageId }),
        updatedBy: userId,
      },
    },
    { new: true },
  );
  if (!document) throw new Error('Document not found');
  return document;
};

export const registerDocumentPayment = async ({
  payment,
  userId,
  ...scope
}: DocumentScope & {
  payment: Partial<Payment>;
  userId: UserId;
}) => {
  const document = await findDocument(scope);
  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  return createPayment(
    {
      ...payment,
      amount,
      organizationId: scope.organizationId,
      createdBy: userId,
      updatedBy: userId,
      contactId: document.contactId,
      contactName: document.contactName,
      date: (payment.date ?? new Date().toISOString()) as Payment['date'],
      description: payment.description ?? `Payment for ${document.docNumber ?? scope.documentId}`,
      documentId: scope.documentId,
      documentType: scope.docType,
      direction: scope.docType === 'purchase' ? 'outflow' : 'inflow',
    },
    scope.organizationId,
  );
};

export const downloadDocumentPdf = async (scope: DocumentScope) => {
  const document = await findDocument(scope);
  const organization = await getModel<Organization>(
    Collection.ORGANIZATIONS,
    OrganizationSchemaMongo,
  ).findOne({
    _id: scope.organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
  return {
    buffer: createDocumentPdf(document, organization ?? 'Helebba'),
    filename: getDocumentPdfFilename(document),
  };
};
