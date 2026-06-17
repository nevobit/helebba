import { withPrefix } from '@hlb/constant-definitions';
import type { RouteOptions } from 'fastify';
import { createSubscriptionRoute } from './create';
import { getCurrentSubscriptionRoute } from './current';

export const subscriptionRoutes: RouteOptions[] = withPrefix('/subscriptions', [
  getCurrentSubscriptionRoute,
  createSubscriptionRoute,
]);
