import type {
  ContactId,
  InboxConversationId,
  InboxMessageId,
  InboxDocumentId,
  DocumentId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../common';

export type InboxChannel = 'email' | 'internal' | 'whatsapp' | 'sms' | 'other';
export type InboxConversationStatus = 'open' | 'pending' | 'closed' | 'archived';
export type InboxMessageDirection = 'inbound' | 'outbound' | 'internal';

export interface InboxParticipant {
  type: 'user' | 'contact' | 'external';
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface InboxConversation extends PersistedSoftDeletableEntity<
  InboxConversationId,
  UserId
> {
  subject: string;
  channel: InboxChannel;
  status: InboxConversationStatus;
  participants: InboxParticipant[];
  contactId?: ContactId;
  assignedTo?: UserId;
  tags: string[];
  unreadBy: UserId[];
  lastMessageAt?: Date;
  lastMessagePreview: string;
  messageCount: number;
}

export interface InboxMessage extends PersistedSoftDeletableEntity<InboxMessageId, UserId> {
  conversationId: InboxConversationId;
  direction: InboxMessageDirection;
  sender: InboxParticipant;
  recipients: InboxParticipant[];
  body: string;
  bodyHtml?: string;
  attachments: Array<{ name: string; url: string; contentType?: string; size?: number }>;
  sentAt: Date;
  readBy: UserId[];
  externalId?: string;
}

export interface InboxConversationFilters {
  status?: InboxConversationStatus;
  channel?: InboxChannel;
  assignedTo?: string;
  contactId?: string;
  unreadBy?: string;
  search?: string;
}

export type InboxDocumentStatus = 'pending' | 'processed' | 'attached' | 'rejected';

export interface InboxDocumentFile {
  name: string;
  url: string;
  key?: string;
  contentType?: string;
  size?: number;
}

export interface InboxDocument extends PersistedSoftDeletableEntity<InboxDocumentId, UserId> {
  name: string;
  status: InboxDocumentStatus;
  documentType?: string;
  contactId?: ContactId;
  documentId?: DocumentId;
  notes?: string;
  file: InboxDocumentFile;
  thumbnailUrl?: string;
  processedAt?: Date;
  attachedAt?: Date;
}

export interface InboxDocumentFilters {
  status?: InboxDocumentStatus;
  documentType?: string;
  contactId?: string;
  search?: string;
}
