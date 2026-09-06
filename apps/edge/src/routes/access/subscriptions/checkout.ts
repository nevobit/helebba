import { randomUUID } from 'node:crypto';
import { createPlanSnapshot, type BillingInterval, type OrganizationId, type PlanCode, type UserId } from '@hlb/contracts';
import { getCurrentOrganizationSubscription, recordSubscriptionCheckout } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { createSubscriptionCheckout, type BillingProvider } from '@hlb/integrations';
import { verifyJwt } from '@hlb/security';
import { problem } from '../auth/responses';

type CheckoutBody = {
  provider?: BillingProvider;
  planCode?: PlanCode;
  interval?: BillingInterval;
  customerEmail?: string;
};

export const createSubscriptionCheckoutRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/checkout',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = (req.body ?? {}) as CheckoutBody;
    if (body.provider !== 'stripe' && body.provider !== 'mercadopago') {
      problem(reply, 400, 'provider must be stripe or mercadopago', 'invalid_billing_provider');
      return;
    }
    if (!body.customerEmail || !/^\S+@\S+\.\S+$/.test(body.customerEmail)) {
      problem(reply, 400, 'A valid customerEmail is required', 'invalid_customer_email');
      return;
    }
    const organizationId = req.organization?.organizationId as OrganizationId;
    const subscription = await getCurrentOrganizationSubscription(organizationId);
    if (!subscription) {
      problem(reply, 404, 'Subscription not found', 'subscription_not_found');
      return;
    }
    const plan = createPlanSnapshot({
      planCode: body.planCode ?? subscription.plan.code,
      interval: body.interval ?? subscription.plan.interval,
    });
    const appUrl = (process.env.PUBLIC_APP_URL ?? process.env.WEB_APP_URL ?? 'http://localhost:5174').replace(/\/$/, '');
    const requestKey = String(req.headers['idempotency-key'] ?? randomUUID());
    const checkout = await createSubscriptionCheckout(
      {
        provider: body.provider,
        organizationId: String(organizationId),
        subscriptionId: String(subscription.id),
        planCode: plan.code,
        planName: plan.name,
        interval: plan.interval,
        amount: plan.price,
        currency: plan.currency,
        customerEmail: body.customerEmail,
        successUrl: `${appUrl}/settings/billing?checkout=success&provider=${body.provider}`,
        cancelUrl: `${appUrl}/settings/billing?checkout=cancelled&provider=${body.provider}`,
        idempotencyKey: `${organizationId}:${requestKey}`,
      },
      {
        stripeSecretKey: process.env.STRIPE_SECRET_KEY,
        mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      },
    );
    await recordSubscriptionCheckout({
      organizationId,
      userId: req.auth?.userId as UserId,
      provider: checkout.provider,
      checkoutId: checkout.checkoutId,
      checkoutUrl: checkout.checkoutUrl,
      plan,
    });
    reply.status(201).send(checkout);
  },
);
