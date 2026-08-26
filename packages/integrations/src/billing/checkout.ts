import type {
  BillingProviderConfig,
  CreateSubscriptionCheckoutInput,
  SubscriptionCheckoutResult,
} from './types';

const requireValue = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`${name} is not configured`);
  return value;
};

const parseResponse = async (response: Response) => {
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    const message = body?.message ?? body?.error_description ?? body?.error ?? response.statusText;
    throw new Error(`Billing provider rejected the request: ${String(message)}`);
  }
  return body ?? {};
};

const createStripeCheckout = async (
  input: CreateSubscriptionCheckoutInput,
  secretKey: string,
): Promise<SubscriptionCheckoutResult> => {
  const amount = input.interval === 'yearly' ? input.amount * 12 : input.amount;
  const params = new URLSearchParams({
    mode: 'subscription',
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: input.customerEmail,
    client_reference_id: input.organizationId,
    'metadata[organizationId]': input.organizationId,
    'metadata[subscriptionId]': input.subscriptionId,
    'subscription_data[metadata][organizationId]': input.organizationId,
    'subscription_data[metadata][subscriptionId]': input.subscriptionId,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': input.currency.toLowerCase(),
    'line_items[0][price_data][unit_amount]': String(Math.round(amount)),
    'line_items[0][price_data][product_data][name]': `Helebba ${input.planName}`,
    'line_items[0][price_data][recurring][interval]': input.interval === 'yearly' ? 'year' : 'month',
  });
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': input.idempotencyKey,
    },
    body: params,
  });
  const body = await parseResponse(response);
  if (!body.id || !body.url) throw new Error('Stripe returned an incomplete checkout session');
  return { provider: 'stripe', checkoutId: String(body.id), checkoutUrl: String(body.url) };
};

const createMercadoPagoCheckout = async (
  input: CreateSubscriptionCheckoutInput,
  accessToken: string,
): Promise<SubscriptionCheckoutResult> => {
  const frequency = input.interval === 'yearly' ? 12 : 1;
  const response = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': input.idempotencyKey,
    },
    body: JSON.stringify({
      reason: `Helebba ${input.planName}`,
      external_reference: input.organizationId,
      payer_email: input.customerEmail,
      back_url: input.successUrl,
      status: 'pending',
      auto_recurring: {
        frequency,
        frequency_type: 'months',
        transaction_amount: input.interval === 'yearly' ? input.amount * 12 : input.amount,
        currency_id: input.currency.toUpperCase(),
      },
    }),
  });
  const body = await parseResponse(response);
  if (!body.id || !body.init_point) {
    throw new Error('Mercado Pago returned an incomplete preapproval');
  }
  return {
    provider: 'mercadopago',
    checkoutId: String(body.id),
    checkoutUrl: String(body.init_point),
  };
};

export const createSubscriptionCheckout = (
  input: CreateSubscriptionCheckoutInput,
  config: BillingProviderConfig,
) => {
  if (input.provider === 'stripe') {
    return createStripeCheckout(input, requireValue(config.stripeSecretKey, 'STRIPE_SECRET_KEY'));
  }
  return createMercadoPagoCheckout(
    input,
    requireValue(config.mercadoPagoAccessToken, 'MERCADOPAGO_ACCESS_TOKEN'),
  );
};
