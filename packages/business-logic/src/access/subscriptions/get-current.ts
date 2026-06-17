import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type OrganizationId,
  type Subscription,
  SubscriptionSchemaMongo,
} from '@hlb/contracts';

export const getCurrentOrganizationSubscription = async (organizationId: OrganizationId) => {
  const model = getModel<Subscription>(Collection.SUBSCRIPTIONS, SubscriptionSchemaMongo);

  return await model.findOne({
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
};
