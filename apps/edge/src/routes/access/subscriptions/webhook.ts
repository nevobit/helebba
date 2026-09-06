import { Readable } from 'node:stream';
import { applySubscriptionBillingEvent } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { ISODateTimeString, OrganizationId } from '@hlb/contracts';
import {
  fetchMercadoPagoSubscriptionEvent,
  parseStripeWebhook,
  verifyMercadoPagoSignature,
  type BillingProvider,
  type BillingWebhookEvent,
} from '@hlb/integrations';

const rawBodyHook = async (request: any, _reply: unknown, payload: NodeJS.ReadableStream) => {
  const chunks: Buffer[] = [];
  for await (const chunk of payload) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const buffer = Buffer.concat(chunks);
  request.rawBody = buffer.toString('utf8');
  return Readable.from(buffer);
};

const applyEvent = async (event: BillingWebhookEvent) => {
  if (!event.organizationId) return false;
  await applySubscriptionBillingEvent({
    organizationId: event.organizationId as OrganizationId,
    provider: event.provider,
    eventId: event.eventId,
    eventType: event.eventType,
    providerSubscriptionId: event.providerSubscriptionId,
    status: event.status,
    currentPeriodStartedAt: event.currentPeriodStartedAt as ISODateTimeString | undefined,
    currentPeriodEndsAt: event.currentPeriodEndsAt as ISODateTimeString | undefined,
  });
  return true;
};

export const subscriptionWebhookRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/webhooks/:provider',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const { provider } = req.params as { provider: BillingProvider };
    if (provider === 'stripe') {
      const signature = String(req.headers['stripe-signature'] ?? '');
      const event = parseStripeWebhook({
        rawBody: String((req as any).rawBody ?? ''),
        signature,
        secret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
      });
      await applyEvent(event);
      reply.status(200).send({ received: true });
      return;
    }
    if (provider === 'mercadopago') {
      const body = (req.body ?? {}) as Record<string, any>;
      const query = (req.query ?? {}) as Record<string, string>;
      const dataId = String(body.data?.id ?? query['data.id'] ?? query.id ?? '');
      const requestId = String(req.headers['x-request-id'] ?? '');
      const signature = String(req.headers['x-signature'] ?? '');
      const isValid = verifyMercadoPagoSignature({
        dataId,
        requestId,
        signature,
        secret: process.env.MERCADOPAGO_WEBHOOK_SECRET ?? '',
      });
      if (!isValid) {
        reply.status(401).send({ received: false });
        return;
      }
      const event = await fetchMercadoPagoSubscriptionEvent({
        preapprovalId: dataId,
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? '',
        eventId: String(body.id ?? requestId),
        eventType: String(body.type ?? body.action ?? 'subscription_preapproval'),
      });
      await applyEvent(event);
      reply.status(200).send({ received: true });
      return;
    }
    reply.status(404).send({ received: false });
  },
  { preParsing: rawBodyHook as any },
);
