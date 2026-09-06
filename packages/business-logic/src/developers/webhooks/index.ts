import { createHmac, randomBytes } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  WEBHOOK_EVENT_NAMES,
  WebhookDeliverySchemaMongo,
  WebhookSubscriptionSchemaMongo,
  type OrganizationId,
  type UserId,
  type WebhookDelivery,
  type WebhookDeliveryId,
  type WebhookEventName,
  type WebhookSubscription,
  type WebhookSubscriptionId,
} from '@hlb/contracts';

const subscriptions = () =>
  getModel<WebhookSubscription>(Collection.WEBHOOK_SUBSCRIPTIONS, WebhookSubscriptionSchemaMongo);
const deliveries = () =>
  getModel<WebhookDelivery>(Collection.WEBHOOK_DELIVERIES, WebhookDeliverySchemaMongo);

const reservedHeaders = new Set([
  'authorization',
  'content-length',
  'content-type',
  'host',
  'hlb-signature',
  'hlb-event',
]);

const assertSafeUrl = (value: string) => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Ingresa una URL válida para el webhook.');
  }
  if (!['https:', 'http:'].includes(url.protocol))
    throw new Error('El webhook debe usar HTTP o HTTPS.');
  if (url.username || url.password)
    throw new Error('La URL del webhook no puede incluir credenciales.');
  const host = url.hostname.toLowerCase();
  const blocked =
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);
  if (blocked) throw new Error('La URL del webhook no puede apuntar a una red interna.');
  return url.toString();
};

const normalizeEvents = (values: WebhookEventName[]) => {
  const allowed = new Set<string>(WEBHOOK_EVENT_NAMES);
  const unique = [...new Set(values ?? [])];
  if (!unique.length || unique.some((event) => !allowed.has(event)))
    throw new Error('Selecciona al menos un evento de webhook válido.');
  return unique;
};

const normalizeHeaders = (headers: Record<string, string> = {}) => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const normalized = key.trim().toLowerCase();
    if (!normalized || reservedHeaders.has(normalized))
      throw new Error(`La cabecera “${key}” está reservada.`);
    result[normalized] = String(value);
  }
  return result;
};

export interface CreateWebhookSubscriptionInput {
  name: string;
  url: string;
  events: WebhookEventName[];
  active?: boolean;
  customHeaders?: Record<string, string>;
}

export const listWebhookSubscriptions = (organizationId: OrganizationId) =>
  subscriptions()
    .find({ organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } })
    .select('-secret')
    .sort({ createdAt: -1 });

export const getWebhookSubscription = (
  organizationId: OrganizationId,
  subscriptionId: WebhookSubscriptionId,
) =>
  subscriptions()
    .findOne({
      _id: subscriptionId,
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    })
    .select('-secret');

export const listWebhookEventTypes = () => [...WEBHOOK_EVENT_NAMES];

export const setWebhookSubscriptionActive = (
  organizationId: OrganizationId,
  userId: UserId,
  subscriptionId: WebhookSubscriptionId,
  active: boolean,
) => updateWebhookSubscription(organizationId, userId, subscriptionId, { active });

export const createWebhookSubscription = async (
  organizationId: OrganizationId,
  userId: UserId,
  input: CreateWebhookSubscriptionInput,
) => {
  if (!input.name?.trim()) throw new Error('Ingresa un nombre para el webhook.');
  return subscriptions().create({
    organizationId,
    name: input.name.trim(),
    url: assertSafeUrl(input.url),
    events: normalizeEvents(input.events),
    active: input.active ?? true,
    customHeaders: normalizeHeaders(input.customHeaders),
    secret: randomBytes(32).toString('hex'),
    failureCount: 0,
    createdBy: userId,
    updatedBy: userId,
  });
};

export const updateWebhookSubscription = async (
  organizationId: OrganizationId,
  userId: UserId,
  subscriptionId: WebhookSubscriptionId,
  input: Partial<CreateWebhookSubscriptionInput>,
) => {
  const update: Record<string, unknown> = { updatedBy: userId };
  if (input.name !== undefined) {
    if (!input.name.trim()) throw new Error('Ingresa un nombre para el webhook.');
    update.name = input.name.trim();
  }
  if (input.url !== undefined) update.url = assertSafeUrl(input.url);
  if (input.events !== undefined) update.events = normalizeEvents(input.events);
  if (input.active !== undefined) update.active = input.active;
  if (input.customHeaders !== undefined)
    update.customHeaders = normalizeHeaders(input.customHeaders);
  const webhook = await subscriptions()
    .findOneAndUpdate(
      { _id: subscriptionId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
      { $set: update },
      { new: true },
    )
    .select('-secret');
  if (!webhook) throw new Error('El webhook no existe.');
  return webhook;
};

export const deleteWebhookSubscription = async (
  organizationId: OrganizationId,
  userId: UserId,
  subscriptionId: WebhookSubscriptionId,
) => {
  const webhook = await subscriptions().findOneAndUpdate(
    { _id: subscriptionId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        active: false,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
      },
    },
  );
  if (!webhook) throw new Error('El webhook no existe.');
  return true;
};

export const rotateWebhookSecret = async (
  organizationId: OrganizationId,
  userId: UserId,
  subscriptionId: WebhookSubscriptionId,
) => {
  const secret = randomBytes(32).toString('hex');
  const webhook = await subscriptions().findOneAndUpdate(
    { _id: subscriptionId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    { $set: { secret, updatedBy: userId } },
  );
  if (!webhook) throw new Error('El webhook no existe.');
  return { secret };
};

export const listWebhookDeliveries = (
  organizationId: OrganizationId,
  subscriptionId?: WebhookSubscriptionId,
) =>
  deliveries()
    .find({
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
      ...(subscriptionId ? { subscriptionId } : {}),
    })
    .sort({ createdAt: -1 })
    .limit(200);

const deliver = async (organizationId: OrganizationId, deliveryId: WebhookDeliveryId) => {
  const delivery = await deliveries().findOne({ _id: deliveryId, organizationId });
  if (!delivery) throw new Error('La entrega no existe.');
  const webhook = await subscriptions()
    .findOne({
      _id: delivery.subscriptionId,
      organizationId,
      active: true,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    })
    .select('+secret');
  if (!webhook) throw new Error('El webhook está desactivado o no existe.');

  const body = JSON.stringify({
    id: delivery.id,
    event: delivery.event,
    createdAt: delivery.createdAt,
    data: delivery.payload,
  });
  const signature = createHmac('sha256', webhook.secret).update(body).digest('hex');
  const attempt = delivery.attempts + 1;
  const customHeaders =
    webhook.customHeaders instanceof Map
      ? Object.fromEntries(webhook.customHeaders.entries())
      : (webhook.customHeaders ?? {});
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'hlb-event': delivery.event,
        'hlb-signature': `sha256=${signature}`,
        ...customHeaders,
      },
      body,
      signal: AbortSignal.timeout(10_000),
      redirect: 'error',
    });
    const responseBody = (await response.text()).slice(0, 2_000);
    if (!response.ok)
      throw Object.assign(new Error(`El endpoint respondió HTTP ${response.status}.`), {
        responseStatus: response.status,
        responseBody,
      });
    const now = new Date();
    await Promise.all([
      deliveries().updateOne(
        { _id: delivery.id },
        {
          $set: {
            status: 'delivered',
            attempts: attempt,
            responseStatus: response.status,
            responseBody,
            deliveredAt: now,
          },
          $unset: { error: 1, nextRetryAt: 1 },
        },
      ),
      subscriptions().updateOne(
        { _id: webhook.id },
        { $set: { lastDeliveredAt: now, failureCount: 0 }, $unset: { lastError: 1 } },
      ),
    ]);
    return true;
  } catch (cause) {
    const error = cause instanceof Error ? cause.message : 'No se pudo entregar el webhook.';
    const retryDelays = [60_000, 300_000, 1_800_000];
    const nextRetryAt =
      attempt <= retryDelays.length ? new Date(Date.now() + retryDelays[attempt - 1]) : undefined;
    await Promise.all([
      deliveries().updateOne(
        { _id: delivery.id },
        {
          $set: {
            status: nextRetryAt ? 'retrying' : 'failed',
            attempts: attempt,
            error,
            responseStatus: (cause as { responseStatus?: number }).responseStatus,
            responseBody: (cause as { responseBody?: string }).responseBody,
            nextRetryAt,
          },
        },
      ),
      subscriptions().updateOne(
        { _id: webhook.id },
        { $inc: { failureCount: 1 }, $set: { lastError: error } },
      ),
    ]);
    return false;
  }
};

export const retryWebhookDelivery = deliver;

export const processDueWebhookDeliveries = async (limit = 100) => {
  const now = new Date();
  const abandonedPendingBefore = new Date(now.getTime() - 30_000);
  const due = await deliveries()
    .find({
      $or: [
        { status: 'retrying', nextRetryAt: { $lte: now } },
        { status: 'pending', createdAt: { $lte: abandonedPendingBefore } },
      ],
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    })
    .sort({ nextRetryAt: 1, createdAt: 1 })
    .limit(Math.max(1, Math.min(limit, 500)));
  const results = await Promise.allSettled(
    due.map((delivery) => deliver(delivery.organizationId, delivery.id)),
  );
  return {
    processed: due.length,
    delivered: results.filter((result) => result.status === 'fulfilled' && result.value).length,
  };
};

export const emitWebhookEvent = async (
  organizationId: OrganizationId,
  userId: UserId,
  event: WebhookEventName,
  payload: Record<string, unknown>,
  subscriptionId?: WebhookSubscriptionId,
) => {
  if (!WEBHOOK_EVENT_NAMES.includes(event)) throw new Error('El evento de webhook no es válido.');
  const targets = await subscriptions().find({
    organizationId,
    active: true,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    ...(subscriptionId ? { _id: subscriptionId } : { events: event }),
  });
  const created = await deliveries().insertMany(
    targets.map((target) => ({
      organizationId,
      subscriptionId: target.id,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      createdBy: userId,
      updatedBy: userId,
    })),
  );
  void Promise.allSettled(created.map((delivery) => deliver(organizationId, delivery.id)));
  return created.length;
};

export const queueWebhookEvent = (
  organizationId: OrganizationId | undefined,
  userId: UserId | undefined,
  event: WebhookEventName,
  payload: Record<string, unknown>,
) => {
  if (!organizationId || !userId) return;
  void emitWebhookEvent(organizationId, userId, event, payload).catch(() => undefined);
};
