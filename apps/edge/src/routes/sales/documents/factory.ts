import {
  attachDocumentFile,
  bulkCancelDocuments,
  bulkDeleteDocuments,
  bulkSetDocumentApprovalStatus,
  cancelDocument,
  convertDocument,
  createDocument,
  deleteDocumentAttachment,
  downloadDocumentPdf,
  findDocumentByNumber,
  fulfillDocumentLines,
  getAllDocuments,
  getDocumentAttachment,
  getDocumentById,
  getDocumentFulfilledItems,
  listDocumentAttachments,
  sendDocumentEmail,
  registerDocumentPayment,
  setDocumentApprovalStatus,
  setDocumentPipeline,
  softDeleteDocument,
  updateDocument,
  updateDocumentTracking,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import {
  DocumentApprovalStatus,
  DocumentType,
  type Document as SalesDocument,
  type DocumentId,
  type DocumentTracking,
  type OrganizationId,
  type Payment,
  type UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import type { RouteOptions } from 'fastify';

type DocumentListQuery = {
  page?: string;
  limit?: string;
  paymentMethodId?: string;
  search?: string;
  contactId?: string;
};

type ConvertDocumentBody = {
  docType?: DocumentType;
};

type SendDocumentEmailBody = {
  bcc?: string | string[];
  cc?: string | string[];
  message?: string;
  subject?: string;
  to?: string | string[];
};

type RegisterDocumentPaymentBody = Pick<
  Partial<Payment>,
  'amount' | 'bankAccountId' | 'date' | 'description' | 'paymentMethodId'
>;

type DocumentAttachmentBody = {
  name: string;
  url: string;
  contentType?: string;
  size?: number;
};

type DocumentPipelineBody = {
  pipelineId: string;
  pipelineStageId?: string;
};

type BulkDocumentsBody = { documentIds?: DocumentId[]; ids?: DocumentId[] };
type FulfillLinesBody = {
  lines?: Array<{ lineIndex?: number; line?: number; units?: number }>;
  warehouseId?: string;
};

const DEFAULT_CONVERSION_TARGETS: Partial<Record<DocumentType, DocumentType>> = {
  [DocumentType.INVOICE]: DocumentType.CREDIT_NOTE,
  [DocumentType.SALES_RECEIPT]: DocumentType.CREDIT_NOTE,
  [DocumentType.ESTIMATE]: DocumentType.INVOICE,
  [DocumentType.SALES_ORDER]: DocumentType.INVOICE,
  [DocumentType.WAYBILL]: DocumentType.INVOICE,
  [DocumentType.PROFORM]: DocumentType.INVOICE,
  [DocumentType.PURCHASE]: DocumentType.PURCHASE_REFUND,
  [DocumentType.PURCHASE_ORDER]: DocumentType.PURCHASE,
  [DocumentType.REFERRALS]: DocumentType.PURCHASE,
  [DocumentType.QUOTES]: DocumentType.INVOICE,
};

export const createDocumentRoutes = (prefix: string, docType: DocumentType): RouteOptions[] =>
  withPrefix(prefix, [
    makeFastifyRoute(
      RouteMethod.GET,
      '/',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const query = (req.query ?? {}) as DocumentListQuery;
        const documents = await getAllDocuments({
          organizationId: req.organization?.organizationId as OrganizationId,
          docType,
          page: Number(query.page ?? 1),
          limit: Number(query.limit ?? 100),
          paymentMethodId: query.paymentMethodId,
          search: query.search ?? '',
          contactId: query.contactId,
        });

        reply.status(200).send(documents);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const body = req.body as Partial<SalesDocument>;
        const { userId } = req.auth as unknown as { userId: UserId };
        const document = await createDocument(
          {
            ...body,
            organizationId: req.organization?.organizationId as OrganizationId,
            createdBy: userId,
            updatedBy: userId,
          },
          docType,
        );

        reply.status(201).send(document);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/bulk/cancel',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const body = (req.body ?? {}) as BulkDocumentsBody;
        const { userId } = req.auth as unknown as { userId: UserId };
        const result = await bulkCancelDocuments({
          documentIds: body.documentIds ?? body.ids ?? [],
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          userId,
        });
        reply.status(200).send(result);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/bulk/approve',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const body = (req.body ?? {}) as BulkDocumentsBody;
        const { userId } = req.auth as unknown as { userId: UserId };
        const result = await bulkSetDocumentApprovalStatus({
          documentIds: body.documentIds ?? body.ids ?? [],
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          status: DocumentApprovalStatus.APPROVED,
          userId,
        });
        reply.status(200).send(result);
      },
    ),
    makeFastifyRoute(
      RouteMethod.DELETE,
      '/bulk',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const body = (req.body ?? {}) as BulkDocumentsBody;
        const { userId } = req.auth as unknown as { userId: UserId };
        const result = await bulkDeleteDocuments({
          documentIds: body.documentIds ?? body.ids ?? [],
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          userId,
        });
        reply.status(200).send(result);
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/number/:docNumber',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { docNumber } = req.params as { docNumber: string };
        const document = await findDocumentByNumber({
          docNumber,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
        });
        reply.status(200).send(document);
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/:documentId',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const document = await getDocumentById(
          documentId,
          req.organization?.organizationId as OrganizationId,
        );

        reply.status(document ? 200 : 404).send(document ?? { message: 'Document not found' });
      },
    ),
    makeFastifyRoute(
      RouteMethod.PATCH,
      '/:documentId',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const body = req.body as Partial<SalesDocument>;
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const document = await updateDocument(
          documentId,
          {
            ...body,
            updatedBy: userId,
            docType,
          },
          req.organization?.organizationId as OrganizationId,
        );

        reply.status(200).send(document);
      },
    ),
    makeFastifyRoute(
      RouteMethod.PUT,
      '/:documentId',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const body = req.body as Partial<SalesDocument>;
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const document = await updateDocument(
          documentId,
          {
            ...body,
            updatedBy: userId,
            docType,
          },
          req.organization?.organizationId as OrganizationId,
        );

        reply.status(200).send(document);
      },
    ),
    makeFastifyRoute(
      RouteMethod.DELETE,
      '/:documentId',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const document = await softDeleteDocument({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          userId,
        });

        reply.status(document ? 200 : 404).send(document ?? { message: 'Document not found' });
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/convert',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const body = (req.body ?? {}) as ConvertDocumentBody;
        const { userId } = req.auth as unknown as { userId: UserId };
        const targetDocType = body.docType ?? DEFAULT_CONVERSION_TARGETS[docType];

        if (!targetDocType) {
          reply.status(400).send({
            message: `A target docType is required to convert a ${docType}.`,
          });
          return;
        }
        const document = await convertDocument({
          documentId,
          organizationId: req.organization?.organizationId as OrganizationId,
          targetDocType,
          userId,
        });

        reply.status(201).send(document);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/send-email',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const body = (req.body ?? {}) as SendDocumentEmailBody;
        const { userId } = req.auth as unknown as { userId: UserId };
        const result = await sendDocumentEmail({
          bcc: body.bcc,
          cc: body.cc,
          documentId,
          docType,
          message: body.message,
          organizationId: req.organization?.organizationId as OrganizationId,
          subject: body.subject,
          to: body.to,
          userId,
        });

        reply.status(202).send(result);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/send',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const body = (req.body ?? {}) as SendDocumentEmailBody;
        const { userId } = req.auth as unknown as { userId: UserId };
        const result = await sendDocumentEmail({
          bcc: body.bcc,
          cc: body.cc,
          documentId,
          docType,
          message: body.message,
          organizationId: req.organization?.organizationId as OrganizationId,
          subject: body.subject,
          to: body.to,
          userId,
        });

        reply.status(202).send(result);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/approve',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const document = await setDocumentApprovalStatus({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          status: DocumentApprovalStatus.APPROVED,
          userId,
        });

        reply.status(document ? 200 : 404).send(document ?? { message: 'Document not found' });
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/cancel',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const document = await cancelDocument({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          userId,
        });
        reply.status(200).send(document);
      },
    ),
    ...([DocumentType.SALES_ORDER, DocumentType.PURCHASE_ORDER].includes(docType)
      ? [
          makeFastifyRoute(
            RouteMethod.POST,
            '/:documentId/shipall',
            verifyJwt,
            { organization: 'required', auth: 'required' },
            async (req, reply) => {
              const { documentId } = req.params as { documentId: DocumentId };
              const { userId } = req.auth as unknown as { userId: UserId };
              const body = (req.body ?? {}) as FulfillLinesBody;
              const document = await fulfillDocumentLines({
                documentId,
                docType,
                organizationId: req.organization?.organizationId as OrganizationId,
                warehouseId: body.warehouseId,
                userId,
              });
              reply.status(200).send(document);
            },
          ),
          makeFastifyRoute(
            RouteMethod.POST,
            '/:documentId/shipbylines',
            verifyJwt,
            { organization: 'required', auth: 'required' },
            async (req, reply) => {
              const { documentId } = req.params as { documentId: DocumentId };
              const { userId } = req.auth as unknown as { userId: UserId };
              const body = (req.body ?? {}) as FulfillLinesBody;
              const document = await fulfillDocumentLines({
                documentId,
                docType,
                organizationId: req.organization?.organizationId as OrganizationId,
                lines: (body.lines ?? []).map((line) => ({
                  lineIndex: line.lineIndex ?? line.line ?? -1,
                  units: line.units,
                })),
                warehouseId: body.warehouseId,
                userId,
              });
              reply.status(200).send(document);
            },
          ),
          makeFastifyRoute(
            RouteMethod.GET,
            '/:documentId/shippeditems',
            verifyJwt,
            { organization: 'required', auth: 'required' },
            async (req, reply) => {
              const { documentId } = req.params as { documentId: DocumentId };
              const items = await getDocumentFulfilledItems({
                documentId,
                docType,
                organizationId: req.organization?.organizationId as OrganizationId,
              });
              reply.status(200).send(items);
            },
          ),
        ]
      : []),
    ...([DocumentType.SALES_ORDER, DocumentType.WAYBILL].includes(docType)
      ? [
          makeFastifyRoute(
            RouteMethod.POST,
            '/:documentId/updatetracking',
            verifyJwt,
            { organization: 'required', auth: 'required' },
            async (req, reply) => {
              const { documentId } = req.params as { documentId: DocumentId };
              const { userId } = req.auth as unknown as { userId: UserId };
              const document = await updateDocumentTracking({
                documentId,
                docType,
                organizationId: req.organization?.organizationId as OrganizationId,
                tracking: (req.body ?? {}) as DocumentTracking,
                userId,
              });
              reply.status(200).send(document);
            },
          ),
        ]
      : []),
    ...(docType === DocumentType.PURCHASE_ORDER
      ? [
          makeFastifyRoute(
            RouteMethod.POST,
            '/:documentId/receiveunits',
            verifyJwt,
            { organization: 'required', auth: 'required' },
            async (req, reply) => {
              const { documentId } = req.params as { documentId: DocumentId };
              const { userId } = req.auth as unknown as { userId: UserId };
              const body = (req.body ?? {}) as FulfillLinesBody;
              const document = await fulfillDocumentLines({
                documentId,
                docType,
                organizationId: req.organization?.organizationId as OrganizationId,
                lines: body.lines?.map((line) => ({
                  lineIndex: line.lineIndex ?? line.line ?? -1,
                  units: line.units,
                })),
                warehouseId: body.warehouseId,
                userId,
              });
              reply.status(200).send(document);
            },
          ),
          makeFastifyRoute(
            RouteMethod.GET,
            '/:documentId/receiveditems',
            verifyJwt,
            { organization: 'required', auth: 'required' },
            async (req, reply) => {
              const { documentId } = req.params as { documentId: DocumentId };
              const items = await getDocumentFulfilledItems({
                documentId,
                docType,
                organizationId: req.organization?.organizationId as OrganizationId,
              });
              reply.status(200).send(items);
            },
          ),
        ]
      : []),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/accept',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const document = await setDocumentApprovalStatus({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          status: DocumentApprovalStatus.ACCEPTED,
          userId,
        });

        reply.status(document ? 200 : 404).send(document ?? { message: 'Document not found' });
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/reject',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const document = await setDocumentApprovalStatus({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          status: DocumentApprovalStatus.REJECTED,
          userId,
        });

        reply.status(document ? 200 : 404).send(document ?? { message: 'Document not found' });
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/payment',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const result = await registerDocumentPayment({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          payment: (req.body ?? {}) as RegisterDocumentPaymentBody,
          userId,
        });

        reply.status(201).send(result);
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/:documentId/pdf',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const result = await downloadDocumentPdf({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
        });

        reply.header('Content-Type', 'application/pdf');
        reply.header('Content-Disposition', `inline; filename="${result.filename}"`);
        reply.status(200).send(result.buffer);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/attachments',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const attachment = await attachDocumentFile({
          attachment: req.body as DocumentAttachmentBody,
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          userId,
        });
        reply.status(201).send(attachment);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/attach',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const attachment = await attachDocumentFile({
          attachment: req.body as DocumentAttachmentBody,
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          userId,
        });
        reply.status(201).send(attachment);
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/:documentId/attachments',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const attachments = await listDocumentAttachments({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
        });
        reply.status(200).send(attachments);
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/:documentId/attachments/list',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const attachments = await listDocumentAttachments({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
        });
        reply.status(200).send(attachments);
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/:documentId/attachments/get',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { filename } = (req.query ?? {}) as { filename?: string };
        if (!filename) {
          reply.status(400).send({ message: 'filename is required' });
          return;
        }
        const attachments = await listDocumentAttachments({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
        });
        const attachment = attachments.find((item) => item.name === filename);
        reply
          .status(attachment ? 200 : 404)
          .send(attachment ?? { message: 'Attachment not found' });
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/:documentId/attachments/:attachmentId',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { attachmentId, documentId } = req.params as {
          attachmentId: string;
          documentId: DocumentId;
        };
        const attachment = await getDocumentAttachment({
          attachmentId,
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
        });
        reply.status(200).send(attachment);
      },
    ),
    makeFastifyRoute(
      RouteMethod.DELETE,
      '/:documentId/attachments/:attachmentId',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { attachmentId, documentId } = req.params as {
          attachmentId: string;
          documentId: DocumentId;
        };
        const { userId } = req.auth as unknown as { userId: UserId };
        const result = await deleteDocumentAttachment({
          attachmentId,
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          userId,
        });
        reply.status(200).send(result);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/pipeline',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const body = req.body as DocumentPipelineBody;
        const document = await setDocumentPipeline({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          pipelineId: body.pipelineId,
          pipelineStageId: body.pipelineStageId,
          userId,
        });
        reply.status(200).send(document);
      },
    ),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:documentId/set-pipeline',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const { userId } = req.auth as unknown as { userId: UserId };
        const body = req.body as DocumentPipelineBody;
        const document = await setDocumentPipeline({
          documentId,
          docType,
          organizationId: req.organization?.organizationId as OrganizationId,
          pipelineId: body.pipelineId,
          pipelineStageId: body.pipelineStageId,
          userId,
        });
        reply.status(200).send(document);
      },
    ),
  ]);
