import type {
  PersistedSoftDeletableEntity,
  UserId,
  WebhookDeliveryId,
  WebhookSubscriptionId,
} from '../../../common';

export const WEBHOOK_EVENT_NAMES = [
  'contact.created',
  'contact.updated',
  'contact.deleted',
  'product.created',
  'product.updated',
  'product.deleted',
  'document.created',
  'document.updated',
  'document.deleted',
  'payment.created',
  'payment.updated',
  'crm.opportunity.created',
  'crm.opportunity.updated',
  'crm.opportunity.deleted',
  'crm.activity.created',
  'crm.activity.updated',
  'crm.activity.deleted',
  'project.created',
  'project.updated',
  'project.deleted',
  'project.task.created',
  'project.task.updated',
  'project.task.deleted',
  'project.time-entry.created',
  'project.time-entry.updated',
  'project.time-entry.deleted',
  'crm.funnel.created',
  'crm.funnel.updated',
  'crm.funnel.deleted',
  'calendar.event.created',
  'calendar.event.updated',
  'calendar.event.deleted',
  'booking.created',
  'booking.updated',
  'booking.cancelled',
  'inbox.conversation.created',
  'inbox.conversation.updated',
  'inbox.conversation.deleted',
  'inbox.message.created',
  'inbox.message.deleted',
] as const;

export type WebhookEventName = (typeof WEBHOOK_EVENT_NAMES)[number];

export interface WebhookSubscription extends PersistedSoftDeletableEntity<
  WebhookSubscriptionId,
  UserId
> {
  name: string;
  url: string;
  events: WebhookEventName[];
  active: boolean;
  secret: string;
  customHeaders: Record<string, string>;
  failureCount: number;
  lastDeliveredAt?: Date;
  lastError?: string;
}

export type WebhookDeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying';

export interface WebhookDelivery extends PersistedSoftDeletableEntity<WebhookDeliveryId, UserId> {
  subscriptionId: WebhookSubscriptionId;
  event: WebhookEventName;
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  attempts: number;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  deliveredAt?: Date;
  nextRetryAt?: Date;
}
