import { Schema } from 'mongoose';
import { baseFields, opts } from '../../common';
import type { InboxConversation, InboxDocument, InboxMessage } from './inbox';

const participant = new Schema(
  {
    type: { type: String, enum: ['user', 'contact', 'external'], required: true },
    id: { type: String },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false },
);

export const InboxConversationSchemaMongo = new Schema<InboxConversation>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    subject: { type: String, required: true, trim: true },
    channel: {
      type: String,
      enum: ['email', 'internal', 'whatsapp', 'sms', 'other'],
      default: 'internal',
    },
    status: { type: String, enum: ['open', 'pending', 'closed', 'archived'], default: 'open' },
    participants: { type: [participant], default: [] },
    contactId: { type: String, index: true },
    assignedTo: { type: String, index: true },
    tags: { type: [String], default: [] },
    unreadBy: { type: [String], default: [] },
    lastMessageAt: { type: Date, index: true },
    lastMessagePreview: { type: String, default: '' },
    messageCount: { type: Number, default: 0, min: 0 },
  },
  { ...opts },
);

InboxConversationSchemaMongo.index({ organizationId: 1, status: 1, lastMessageAt: -1 });

export const InboxMessageSchemaMongo = new Schema<InboxMessage>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    conversationId: { type: String, required: true, index: true },
    direction: { type: String, enum: ['inbound', 'outbound', 'internal'], required: true },
    sender: { type: participant, required: true },
    recipients: { type: [participant], default: [] },
    body: { type: String, required: true },
    bodyHtml: { type: String },
    attachments: {
      type: [
        new Schema(
          {
            name: { type: String, required: true },
            url: { type: String, required: true },
            contentType: { type: String },
            size: { type: Number, min: 0 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    sentAt: { type: Date, required: true, index: true },
    readBy: { type: [String], default: [] },
    externalId: { type: String },
  },
  { ...opts },
);

InboxMessageSchemaMongo.index({ organizationId: 1, conversationId: 1, sentAt: 1 });
InboxMessageSchemaMongo.index({ organizationId: 1, externalId: 1 }, { unique: true, sparse: true });

export const InboxDocumentSchemaMongo = new Schema<InboxDocument>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'processed', 'attached', 'rejected'],
      default: 'pending',
      index: true,
    },
    documentType: { type: String, trim: true, index: true },
    contactId: { type: String, index: true },
    documentId: { type: String, index: true },
    notes: { type: String, trim: true },
    file: {
      type: new Schema(
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          key: { type: String },
          contentType: { type: String },
          size: { type: Number, min: 0 },
        },
        { _id: false },
      ),
      required: true,
    },
    thumbnailUrl: { type: String },
    processedAt: { type: Date },
    attachedAt: { type: Date },
  },
  { ...opts },
);

InboxDocumentSchemaMongo.index({ organizationId: 1, createdAt: -1 });
