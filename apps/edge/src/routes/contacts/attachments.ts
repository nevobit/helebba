import {
  attachContactFile,
  getContactAttachment,
  getContactPortalLink,
  listContactAttachments,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { ContactAttachment, ContactId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type AttachmentBody = Pick<ContactAttachment, 'name' | 'url'> &
  Partial<Pick<ContactAttachment, 'contentType' | 'size'>>;

const context = (req: { params: unknown; organization?: { organizationId?: unknown } }) => ({
  contactId: (req.params as { contactId: ContactId }).contactId,
  organizationId: req.organization?.organizationId as OrganizationId,
});

const attach = (path: string) =>
  makeFastifyRoute(
    RouteMethod.POST,
    path,
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const attachment = await attachContactFile({
        ...context(req),
        attachment: req.body as AttachmentBody,
        userId: (req.auth as unknown as { userId: UserId }).userId,
      });
      reply.status(201).send(attachment);
    },
  );

const list = (path: string) =>
  makeFastifyRoute(
    RouteMethod.GET,
    path,
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => reply.status(200).send(await listContactAttachments(context(req))),
  );

export const contactAttachmentRoutes = [
  attach('/:contactId/attachments'),
  attach('/:contactId/attach'),
  list('/:contactId/attachments'),
  list('/:contactId/attachments/list'),
  makeFastifyRoute(
    RouteMethod.GET,
    '/:contactId/attachments/get',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { filename } = req.query as { filename?: string };
      reply.status(200).send(await getContactAttachment({ ...context(req), filename }));
    },
  ),
  makeFastifyRoute(
    RouteMethod.GET,
    '/:contactId/attachments/:attachmentId',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { attachmentId } = req.params as { attachmentId: string };
      reply.status(200).send(await getContactAttachment({ ...context(req), attachmentId }));
    },
  ),
  makeFastifyRoute(
    RouteMethod.GET,
    '/:contactId/portal-link',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => reply.status(200).send(await getContactPortalLink(context(req))),
  ),
];
