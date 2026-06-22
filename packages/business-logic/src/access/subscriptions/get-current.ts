import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type OrganizationId,
  type Subscription,
  SubscriptionSchemaMongo,
} from '@hlb/contracts';

export const getCurrentOrganizationSubscription = async (organizationId: OrganizationId) => {
  const model = getModel<Subscription>(Collection.SUBSCRIPTIONS, SubscriptionSchemaMongo);

  const subscription = await model.findOne({
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!subscription) return null;

  const trialEndsAt = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const isExpiredTrial =
    subscription.status === 'trialing' &&
    trialEndsAt &&
    !Number.isNaN(trialEndsAt.getTime()) &&
    trialEndsAt.getTime() <= Date.now();

  if (!isExpiredTrial) return subscription;

  await model.updateOne(
    { _id: subscription.id },
    {
      $set: {
        status: 'expired',
        updatedAt: new Date(),
      },
    },
  );

  return model.findById(subscription.id);
};
