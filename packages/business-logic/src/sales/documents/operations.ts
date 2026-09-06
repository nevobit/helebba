import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentApprovalStatus,
  DocumentSchemaMongo,
  LifecycleStatus,
  type Document as SalesDocument,
  type DocumentAttachment,
  type DocumentId,
  type DocumentType,
  type OrganizationId,
  type Payment,
  type UserId,
} from '@hlb/contracts';
import { createPayment } from '../../accounting/payments';
import { createDocumentPdf, getDocumentPdfFilename } from './pdf';

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
  return {
    buffer: createDocumentPdf(document, 'Helebba'),
    filename: getDocumentPdfFilename(document),
  };
};
