export type BillingProvider = 'stripe' | 'mercadopago';

export interface CreateSubscriptionCheckoutInput {
  provider: BillingProvider;
  organizationId: string;
  subscriptionId: string;
  planCode: string;
  planName: string;
  interval: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}

export interface SubscriptionCheckoutResult {
  provider: BillingProvider;
  checkoutId: string;
  checkoutUrl: string;
}

export interface BillingProviderConfig {
  stripeSecretKey?: string;
  mercadoPagoAccessToken?: string;
}

export interface BillingWebhookEvent {
  provider: BillingProvider;
  eventId: string;
  eventType: string;
  organizationId?: string;
  providerSubscriptionId?: string;
  status?: 'active' | 'past_due' | 'cancelled';
  currentPeriodStartedAt?: string;
  currentPeriodEndsAt?: string;
  raw: unknown;
}
