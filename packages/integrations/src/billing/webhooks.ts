import { createHmac, timingSafeEqual } from 'node:crypto';
import type { BillingWebhookEvent } from './types';

const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};

export const parseStripeWebhook = (input: {
  rawBody: string;
  signature: string;
  secret: string;
  toleranceSeconds?: number;
}): BillingWebhookEvent => {
  const parts = Object.fromEntries(
    input.signature.split(',').map((part) => {
      const [key, value] = part.split('=', 2);
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) throw new Error('Invalid Stripe signature');
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > (input.toleranceSeconds ?? 300)) {
    throw new Error('Expired Stripe signature');
  }
  const expected = createHmac('sha256', input.secret)
    .update(`${timestamp}.${input.rawBody}`)
    .digest('hex');
  if (!safeEqual(expected, signature)) throw new Error('Invalid Stripe signature');

  const event = JSON.parse(input.rawBody) as Record<string, any>;
  const object = event.data?.object ?? {};
  const subscription = object.subscription ?? (object.object === 'subscription' ? object.id : undefined);
  const metadata = object.metadata ?? object.subscription_details?.metadata ?? {};
  const status =
    event.type === 'invoice.payment_failed'
      ? 'past_due'
      : event.type === 'customer.subscription.deleted'
        ? 'cancelled'
        : event.type === 'checkout.session.completed' || event.type === 'invoice.paid'
          ? 'active'
          : undefined;
  return {
    provider: 'stripe',
    eventId: String(event.id),
    eventType: String(event.type),
    organizationId: metadata.organizationId ?? object.client_reference_id,
    providerSubscriptionId: subscription ? String(subscription) : undefined,
    status,
    currentPeriodStartedAt: object.current_period_start
      ? new Date(object.current_period_start * 1000).toISOString()
      : undefined,
    currentPeriodEndsAt: object.current_period_end
      ? new Date(object.current_period_end * 1000).toISOString()
      : undefined,
    raw: event,
  };
};

export const verifyMercadoPagoSignature = (input: {
  dataId: string;
  requestId: string;
  signature: string;
  secret: string;
}) => {
  const parts = Object.fromEntries(
    input.signature.split(',').map((part) => {
      const [key, value] = part.trim().split('=', 2);
      return [key, value];
    }),
  );
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${input.dataId.toLowerCase()};request-id:${input.requestId};ts:${parts.ts};`;
  const expected = createHmac('sha256', input.secret).update(manifest).digest('hex');
  return safeEqual(expected, parts.v1);
};

export const fetchMercadoPagoSubscriptionEvent = async (input: {
  preapprovalId: string;
  accessToken: string;
  eventId: string;
  eventType: string;
}): Promise<BillingWebhookEvent> => {
  const response = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(input.preapprovalId)}`, {
    headers: { Authorization: `Bearer ${input.accessToken}` },
  });
  if (!response.ok) throw new Error('Could not retrieve Mercado Pago preapproval');
  const body = (await response.json()) as Record<string, any>;
  const status =
    body.status === 'authorized'
      ? 'active'
      : body.status === 'cancelled'
        ? 'cancelled'
        : body.status === 'paused'
          ? 'past_due'
          : undefined;
  return {
    provider: 'mercadopago',
    eventId: input.eventId,
    eventType: input.eventType,
    organizationId: body.external_reference ? String(body.external_reference) : undefined,
    providerSubscriptionId: body.id ? String(body.id) : undefined,
    status,
    currentPeriodStartedAt: body.date_created,
    currentPeriodEndsAt: body.next_payment_date,
    raw: body,
  };
};
