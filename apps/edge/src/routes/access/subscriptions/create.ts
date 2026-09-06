import { createOrganizationSubscription } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import {
  type BillingInterval,
  type OrganizationId,
  type PlanCode,
  type UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { problem } from '../access/auth/responses';

type CreateSubscriptionBody = {
  planCode?: PlanCode;
  interval?: BillingInterval;
  trialDays?: number;
};

export const createSubscriptionRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = (req.body ?? {}) as CreateSubscriptionBody;

    try {
      const subscription = await createOrganizationSubscription({
        organizationId: req.organization?.organizationId as OrganizationId,
        userId: req.auth?.userId as UserId,
        planCode: body.planCode ?? 'plus',
        interval: body.interval ?? 'monthly',
        trialDays: body.trialDays ?? 14,
      });

      reply.status(201).send(subscription);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Organization already has a subscription.'
      ) {
        problem(reply, 409, error.message, 'subscription_already_exists');
        return;
      }

      if (error instanceof Error && error.message === 'Invalid subscription plan') {
        problem(reply, 400, error.message, 'invalid_subscription_plan');
        return;
      }

      throw error;
    }
  },
);
