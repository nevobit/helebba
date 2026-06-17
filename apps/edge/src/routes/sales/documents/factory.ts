import {
  convertDocument,
  createDocument,
  getAllDocuments,
  getDocumentById,
  sendDocumentEmail,
  updateDocument,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import {
  DocumentType,
  type Document as SalesDocument,
  type DocumentId,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import type { RouteOptions } from 'fastify';

type DocumentListQuery = {
  page?: string;
  limit?: string;
  paymentMethodId?: string;
  search?: string;
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
      RouteMethod.POST,
      '/:documentId/convert',
      verifyJwt,
      { organization: 'required', auth: 'required' },
      async (req, reply) => {
        const { documentId } = req.params as { documentId: DocumentId };
        const body = (req.body ?? {}) as ConvertDocumentBody;
        const { userId } = req.auth as unknown as { userId: UserId };
        const targetDocType =
          body.docType ?? (docType === DocumentType.INVOICE ? DocumentType.ESTIMATE : DocumentType.INVOICE);
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
  ]);
