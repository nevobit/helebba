import { withPrefix } from '@hlb/constant-definitions';
import type { RouteOptions } from 'fastify';
import { createSubscriptionRoute } from './create';
import { getCurrentSubscriptionRoute } from './current';
import { createSubscriptionCheckoutRoute } from './checkout';
import { subscriptionWebhookRoute } from './webhook';

export const subscriptionRoutes: RouteOptions[] = withPrefix('/subscriptions', [
  getCurrentSubscriptionRoute,
  createSubscriptionRoute,
  createSubscriptionCheckoutRoute,
  subscriptionWebhookRoute,
]);
