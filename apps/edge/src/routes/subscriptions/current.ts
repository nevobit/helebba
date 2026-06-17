import { getCurrentOrganizationSubscription } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { problem } from '../access/auth/responses';

export const getCurrentSubscriptionRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/current',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const subscription = await getCurrentOrganizationSubscription(
      req.organization?.organizationId as OrganizationId,
    );

    if (!subscription) {
      problem(reply, 404, 'Subscription not found', 'subscription_not_found');
      return;
    }

    reply.status(200).send(subscription);
  },
);
