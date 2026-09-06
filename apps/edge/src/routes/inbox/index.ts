import type { RouteOptions } from 'fastify';
import {
  createInboxConversation,
  createInboxMessage,
  deleteInboxConversation,
  deleteInboxMessage,
  getInboxConversation,
  listInboxConversations,
  listInboxMessages,
  markInboxConversationRead,
  updateInboxConversation,
  attachInboxDocument,
  createInboxDocument,
  deleteInboxDocument,
  getInboxDocument,
  listInboxDocuments,
  updateInboxDocument,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type {
  InboxConversationFilters,
  InboxConversationId,
  InboxMessageId,
  InboxDocumentFilters,
  InboxDocumentId,
  DocumentId,
  OrganizationId,
  UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const guard = [verifyJwt, { organization: 'required', auth: 'required' }] as const;
const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as OrganizationId,
  userId: (req.auth as { userId: UserId }).userId,
});
const params = (req: { params: unknown }) =>
  req.params as { conversationId: InboxConversationId; messageId: InboxMessageId };
const documentParams = (req: { params: unknown }) =>
  req.params as { inboxDocumentId: InboxDocumentId };

const list = makeFastifyRoute(RouteMethod.GET, '/', ...guard, async (req, reply) => {
  reply
    .status(200)
    .send(
      await listInboxConversations(
        context(req).organizationId,
        req.query as InboxConversationFilters,
      ),
    );
});

const create = makeFastifyRoute(RouteMethod.POST, '/', ...guard, async (req, reply) => {
  const { organizationId, userId } = context(req);
  reply.status(201).send(await createInboxConversation(organizationId, userId, req.body as never));
});

const get = makeFastifyRoute(RouteMethod.GET, '/:conversationId', ...guard, async (req, reply) => {
  const conversation = await getInboxConversation(
    context(req).organizationId,
    params(req).conversationId,
  );
  if (!conversation) return reply.status(404).send({ message: 'La conversación no existe.' });
  reply.status(200).send(conversation);
});

const update = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:conversationId',
  ...guard,
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply
      .status(200)
      .send(
        await updateInboxConversation(
          organizationId,
          userId,
          params(req).conversationId,
          req.body as never,
        ),
      );
  },
);

const remove = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:conversationId',
  ...guard,
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    await deleteInboxConversation(organizationId, userId, params(req).conversationId);
    reply.status(200).send(true);
  },
);

const listMessages = makeFastifyRoute(
  RouteMethod.GET,
  '/:conversationId/messages',
  ...guard,
  async (req, reply) => {
    reply
      .status(200)
      .send(await listInboxMessages(context(req).organizationId, params(req).conversationId));
  },
);

const createMessage = makeFastifyRoute(
  RouteMethod.POST,
  '/:conversationId/messages',
  ...guard,
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply
      .status(201)
      .send(
        await createInboxMessage(
          organizationId,
          userId,
          params(req).conversationId,
          req.body as never,
        ),
      );
  },
);

const removeMessage = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:conversationId/messages/:messageId',
  ...guard,
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    await deleteInboxMessage(
      organizationId,
      userId,
      params(req).conversationId,
      params(req).messageId,
    );
    reply.status(200).send(true);
  },
);

const markRead = makeFastifyRoute(
  RouteMethod.POST,
  '/:conversationId/read',
  ...guard,
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    await markInboxConversationRead(organizationId, userId, params(req).conversationId);
    reply.status(200).send(true);
  },
);

export const inboxRoutes: RouteOptions[] = withPrefix('/inbox/conversations', [
  list,
  create,
  get,
  update,
  remove,
  listMessages,
  createMessage,
  removeMessage,
  markRead,
]).concat(
  withPrefix('/inbox/documents', [
    makeFastifyRoute(RouteMethod.POST, '/', ...guard, async (req, reply) => {
      const { organizationId, userId } = context(req);
      reply.status(201).send(await createInboxDocument(organizationId, userId, req.body as never));
    }),
    makeFastifyRoute(RouteMethod.GET, '/', ...guard, async (req, reply) => {
      reply
        .status(200)
        .send(
          await listInboxDocuments(
            context(req).organizationId,
            req.query as InboxDocumentFilters,
          ),
        );
    }),
    makeFastifyRoute(
      RouteMethod.POST,
      '/:inboxDocumentId/attach',
      ...guard,
      async (req, reply) => {
        const { organizationId, userId } = context(req);
        const body = req.body as { documentId: DocumentId };
        reply
          .status(200)
          .send(
            await attachInboxDocument(
              organizationId,
              userId,
              documentParams(req).inboxDocumentId,
              body.documentId,
            ),
          );
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/:inboxDocumentId/file',
      ...guard,
      async (req, reply) => {
        const document = await getInboxDocument(
          context(req).organizationId,
          documentParams(req).inboxDocumentId,
        );
        if (!document)
          return reply.status(404).send({ message: 'El documento entrante no existe.' });
        reply.status(200).send(document.file);
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/:inboxDocumentId/thumbnail',
      ...guard,
      async (req, reply) => {
        const document = await getInboxDocument(
          context(req).organizationId,
          documentParams(req).inboxDocumentId,
        );
        if (!document)
          return reply.status(404).send({ message: 'El documento entrante no existe.' });
        if (!document.thumbnailUrl)
          return reply.status(404).send({ message: 'El documento no tiene miniatura procesada.' });
        reply.status(200).send({ url: document.thumbnailUrl });
      },
    ),
    makeFastifyRoute(
      RouteMethod.GET,
      '/:inboxDocumentId',
      ...guard,
      async (req, reply) => {
        const document = await getInboxDocument(
          context(req).organizationId,
          documentParams(req).inboxDocumentId,
        );
        if (!document)
          return reply.status(404).send({ message: 'El documento entrante no existe.' });
        reply.status(200).send(document);
      },
    ),
    makeFastifyRoute(
      RouteMethod.PATCH,
      '/:inboxDocumentId',
      ...guard,
      async (req, reply) => {
        const { organizationId, userId } = context(req);
        reply
          .status(200)
          .send(
            await updateInboxDocument(
              organizationId,
              userId,
              documentParams(req).inboxDocumentId,
              req.body as never,
            ),
          );
      },
    ),
    makeFastifyRoute(
      RouteMethod.DELETE,
      '/:inboxDocumentId',
      ...guard,
      async (req, reply) => {
        const { organizationId, userId } = context(req);
        await deleteInboxDocument(organizationId, userId, documentParams(req).inboxDocumentId);
        reply.status(200).send(true);
      },
    ),
  ]),
);
