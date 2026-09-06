import { Collection, getModel } from '@hlb/constant-definitions';
import {
  InboxConversationSchemaMongo,
  InboxMessageSchemaMongo,
  InboxDocumentSchemaMongo,
  LifecycleStatus,
  type InboxConversation,
  type InboxConversationFilters,
  type InboxConversationId,
  type InboxMessage,
  type InboxMessageId,
  type InboxDocument,
  type InboxDocumentFilters,
  type InboxDocumentId,
  type DocumentId,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';
import { queueWebhookEvent } from '../developers/webhooks';

const conversations = () =>
  getModel<InboxConversation>(Collection.INBOX_CONVERSATIONS, InboxConversationSchemaMongo);
const messages = () => getModel<InboxMessage>(Collection.INBOX_MESSAGES, InboxMessageSchemaMongo);
const inboxDocuments = () =>
  getModel<InboxDocument>(Collection.INBOX_DOCUMENTS, InboxDocumentSchemaMongo);

type ConversationInput = Pick<
  InboxConversation,
  'subject' | 'channel' | 'participants' | 'contactId' | 'assignedTo' | 'tags'
>;
type MessageInput = Pick<
  InboxMessage,
  | 'direction'
  | 'sender'
  | 'recipients'
  | 'body'
  | 'bodyHtml'
  | 'attachments'
  | 'sentAt'
  | 'externalId'
>;

const active = { lifecycleStatus: { $ne: LifecycleStatus.DELETED } };
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listInboxConversations = (
  organizationId: OrganizationId,
  filters: InboxConversationFilters = {},
) => {
  const query: Record<string, unknown> = { organizationId, ...active };
  if (filters.status) query.status = filters.status;
  if (filters.channel) query.channel = filters.channel;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  if (filters.contactId) query.contactId = filters.contactId;
  if (filters.unreadBy) query.unreadBy = filters.unreadBy;
  if (filters.search) {
    const search = escapeRegExp(filters.search);
    query.$or = [
      { subject: { $regex: search, $options: 'i' } },
      { lastMessagePreview: { $regex: search, $options: 'i' } },
      { 'participants.name': { $regex: search, $options: 'i' } },
      { 'participants.email': { $regex: search, $options: 'i' } },
    ];
  }
  return conversations().find(query).sort({ lastMessageAt: -1, updatedAt: -1 });
};

export const getInboxConversation = async (
  organizationId: OrganizationId,
  conversationId: InboxConversationId,
) => conversations().findOne({ _id: conversationId, organizationId, ...active });

export const createInboxConversation = async (
  organizationId: OrganizationId,
  userId: UserId,
  input: ConversationInput,
) => {
  if (!input.subject?.trim()) throw new Error('Ingresa el asunto de la conversación.');
  const conversation = await conversations().create({
    ...input,
    subject: input.subject.trim(),
    organizationId,
    status: 'open',
    participants: input.participants ?? [],
    tags: [...new Set(input.tags ?? [])],
    unreadBy: [],
    lastMessagePreview: '',
    messageCount: 0,
    createdBy: userId,
    updatedBy: userId,
  });
  queueWebhookEvent(organizationId, userId, 'inbox.conversation.created', {
    conversation: conversation.toObject(),
  });
  return conversation;
};

export const updateInboxConversation = async (
  organizationId: OrganizationId,
  userId: UserId,
  conversationId: InboxConversationId,
  input: Partial<
    Pick<InboxConversation, 'subject' | 'status' | 'assignedTo' | 'tags' | 'participants'>
  >,
) => {
  if (input.subject !== undefined && !input.subject.trim())
    throw new Error('Ingresa el asunto de la conversación.');
  const update: Record<string, unknown> = { updatedBy: userId };
  for (const key of ['subject', 'status', 'assignedTo', 'tags', 'participants'] as const)
    if (input[key] !== undefined) update[key] = input[key];
  if (typeof update.subject === 'string') update.subject = update.subject.trim();
  if (Array.isArray(update.tags)) update.tags = [...new Set(update.tags)];
  const conversation = await conversations().findOneAndUpdate(
    { _id: conversationId, organizationId, ...active },
    { $set: update },
    { new: true },
  );
  if (!conversation) throw new Error('La conversación no existe.');
  queueWebhookEvent(organizationId, userId, 'inbox.conversation.updated', {
    conversation: conversation.toObject(),
  });
  return conversation;
};

export const listInboxMessages = async (
  organizationId: OrganizationId,
  conversationId: InboxConversationId,
) => {
  const conversation = await getInboxConversation(organizationId, conversationId);
  if (!conversation) throw new Error('La conversación no existe.');
  return messages()
    .find({ organizationId, conversationId, ...active })
    .sort({ sentAt: 1 });
};

export const createInboxMessage = async (
  organizationId: OrganizationId,
  userId: UserId,
  conversationId: InboxConversationId,
  input: MessageInput,
) => {
  if (!input.body?.trim()) throw new Error('El mensaje no puede estar vacío.');
  const conversation = await getInboxConversation(organizationId, conversationId);
  if (!conversation) throw new Error('La conversación no existe.');
  const sentAt = input.sentAt ? new Date(input.sentAt) : new Date();
  if (Number.isNaN(sentAt.getTime())) throw new Error('La fecha del mensaje no es válida.');
  const message = await messages().create({
    ...input,
    body: input.body.trim(),
    organizationId,
    conversationId,
    sentAt,
    recipients: input.recipients ?? [],
    attachments: input.attachments ?? [],
    readBy: input.direction === 'inbound' ? [] : [userId],
    createdBy: userId,
    updatedBy: userId,
  });
  const unreadBy =
    input.direction === 'inbound' && conversation.assignedTo ? [conversation.assignedTo] : [];
  await conversations().updateOne(
    { _id: conversationId, organizationId },
    {
      $set: {
        lastMessageAt: sentAt,
        lastMessagePreview: input.body.trim().slice(0, 240),
        updatedBy: userId,
      },
      $inc: { messageCount: 1 },
      ...(unreadBy.length ? { $addToSet: { unreadBy: { $each: unreadBy } } } : {}),
    },
  );
  queueWebhookEvent(organizationId, userId, 'inbox.message.created', {
    message: message.toObject(),
  });
  return message;
};

export const markInboxConversationRead = async (
  organizationId: OrganizationId,
  userId: UserId,
  conversationId: InboxConversationId,
) => {
  const result = await conversations().updateOne(
    { _id: conversationId, organizationId, ...active },
    { $pull: { unreadBy: userId }, $set: { updatedBy: userId } },
  );
  if (!result.matchedCount) throw new Error('La conversación no existe.');
  await messages().updateMany(
    { organizationId, conversationId, ...active },
    { $addToSet: { readBy: userId }, $set: { updatedBy: userId } },
  );
  return true;
};

export const deleteInboxMessage = async (
  organizationId: OrganizationId,
  userId: UserId,
  conversationId: InboxConversationId,
  messageId: InboxMessageId,
) => {
  const message = await messages().findOneAndUpdate(
    { _id: messageId, conversationId, organizationId, ...active },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
      },
    },
  );
  if (!message) throw new Error('El mensaje no existe.');

  const messageQuery = { organizationId, conversationId, ...active };
  const [latestMessage, messageCount] = await Promise.all([
    messages().findOne(messageQuery).sort({ sentAt: -1 }),
    messages().countDocuments(messageQuery),
  ]);
  await conversations().updateOne(
    { _id: conversationId, organizationId },
    {
      $set: {
        messageCount,
        updatedBy: userId,
        ...(latestMessage
          ? {
              lastMessageAt: latestMessage.sentAt,
              lastMessagePreview: latestMessage.body.slice(0, 240),
            }
          : {}),
      },
      ...(!latestMessage ? { $unset: { lastMessageAt: 1, lastMessagePreview: 1 } } : {}),
    },
  );
  queueWebhookEvent(organizationId, userId, 'inbox.message.deleted', {
    messageId,
    conversationId,
  });
  return true;
};

export const deleteInboxConversation = async (
  organizationId: OrganizationId,
  userId: UserId,
  conversationId: InboxConversationId,
) => {
  const now = new Date();
  const conversation = await conversations().findOneAndUpdate(
    { _id: conversationId, organizationId, ...active },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: now,
        deletedBy: userId,
        updatedBy: userId,
      },
    },
  );
  if (!conversation) throw new Error('La conversación no existe.');
  await messages().updateMany(
    { organizationId, conversationId, ...active },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: now,
        deletedBy: userId,
        updatedBy: userId,
      },
    },
  );
  queueWebhookEvent(organizationId, userId, 'inbox.conversation.deleted', { conversationId });
  return true;
};

type InboxDocumentInput = Pick<
  InboxDocument,
  'name' | 'documentType' | 'contactId' | 'notes' | 'file' | 'thumbnailUrl'
>;

export const listInboxDocuments = (
  organizationId: OrganizationId,
  filters: InboxDocumentFilters = {},
) => {
  const query: Record<string, unknown> = { organizationId, ...active };
  if (filters.status) query.status = filters.status;
  if (filters.documentType) query.documentType = filters.documentType;
  if (filters.contactId) query.contactId = filters.contactId;
  if (filters.search) {
    const search = escapeRegExp(filters.search);
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'file.name': { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }
  return inboxDocuments().find(query).sort({ createdAt: -1 });
};

export const getInboxDocument = (organizationId: OrganizationId, id: InboxDocumentId) =>
  inboxDocuments().findOne({ _id: id, organizationId, ...active });

export const createInboxDocument = async (
  organizationId: OrganizationId,
  userId: UserId,
  input: InboxDocumentInput,
) => {
  if (!input.name?.trim()) throw new Error('Ingresa el nombre del documento.');
  if (!input.file?.name?.trim() || !input.file?.url?.trim())
    throw new Error('El archivo del documento es obligatorio.');
  const document = await inboxDocuments().create({
    ...input,
    name: input.name.trim(),
    organizationId,
    status: 'pending',
    createdBy: userId,
    updatedBy: userId,
  });
  queueWebhookEvent(organizationId, userId, 'inbox.document.created', {
    document: document.toObject(),
  });
  return document;
};

export const updateInboxDocument = async (
  organizationId: OrganizationId,
  userId: UserId,
  id: InboxDocumentId,
  input: Partial<Pick<InboxDocument, 'name' | 'status' | 'documentType' | 'contactId' | 'notes' | 'thumbnailUrl'>>,
) => {
  if (input.name !== undefined && !input.name.trim())
    throw new Error('Ingresa el nombre del documento.');
  const update: Record<string, unknown> = { updatedBy: userId };
  for (const key of ['name', 'status', 'documentType', 'contactId', 'notes', 'thumbnailUrl'] as const)
    if (input[key] !== undefined) update[key] = input[key];
  if (typeof update.name === 'string') update.name = update.name.trim();
  if (input.status === 'processed') update.processedAt = new Date();
  const document = await inboxDocuments().findOneAndUpdate(
    { _id: id, organizationId, ...active },
    { $set: update },
    { new: true },
  );
  if (!document) throw new Error('El documento entrante no existe.');
  queueWebhookEvent(organizationId, userId, 'inbox.document.updated', {
    document: document.toObject(),
  });
  return document;
};

export const attachInboxDocument = async (
  organizationId: OrganizationId,
  userId: UserId,
  id: InboxDocumentId,
  documentId: DocumentId,
) => {
  if (!documentId) throw new Error('Selecciona el documento al que deseas adjuntar el archivo.');
  const document = await inboxDocuments().findOneAndUpdate(
    { _id: id, organizationId, ...active },
    {
      $set: {
        documentId,
        status: 'attached',
        attachedAt: new Date(),
        updatedBy: userId,
      },
    },
    { new: true },
  );
  if (!document) throw new Error('El documento entrante no existe.');
  queueWebhookEvent(organizationId, userId, 'inbox.document.attached', {
    document: document.toObject(),
  });
  return document;
};

export const deleteInboxDocument = async (
  organizationId: OrganizationId,
  userId: UserId,
  id: InboxDocumentId,
) => {
  const document = await inboxDocuments().findOneAndUpdate(
    { _id: id, organizationId, ...active },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
      },
    },
  );
  if (!document) throw new Error('El documento entrante no existe.');
  queueWebhookEvent(organizationId, userId, 'inbox.document.deleted', { documentId: id });
  return true;
};
