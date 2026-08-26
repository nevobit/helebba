import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  SubscriptionSchemaMongo,
  type ISODateTimeString,
  type OrganizationId,
  type Subscription,
  type SubscriptionPlanSnapshot,
  type SubscriptionStatus,
  type UserId,
} from '@hlb/contracts';

type SupportedBillingProvider = 'stripe' | 'mercadopago';

export const recordSubscriptionCheckout = async (input: {
  organizationId: OrganizationId;
  userId: UserId;
  provider: SupportedBillingProvider;
  checkoutId: string;
  checkoutUrl: string;
  plan: SubscriptionPlanSnapshot;
}) => {
  const model = getModel<Subscription>(Collection.SUBSCRIPTIONS, SubscriptionSchemaMongo);
  return model.findOneAndUpdate(
    { organizationId: input.organizationId, lifecycleStatus: LifecycleStatus.ACTIVE },
    {
      $set: {
        provider: input.provider,
        plan: input.plan,
        updatedBy: input.userId,
        updatedAt: new Date(),
        'metadata.checkoutId': input.checkoutId,
        'metadata.checkoutUrl': input.checkoutUrl,
        'metadata.checkoutCreatedAt': new Date().toISOString(),
      },
    },
    { new: true },
  );
};

export const applySubscriptionBillingEvent = async (input: {
  organizationId: OrganizationId;
  provider: SupportedBillingProvider;
  eventId: string;
  eventType: string;
  providerSubscriptionId?: string;
  status?: Extract<SubscriptionStatus, 'active' | 'past_due' | 'cancelled'>;
  currentPeriodStartedAt?: ISODateTimeString;
  currentPeriodEndsAt?: ISODateTimeString;
}) => {
  const model = getModel<Subscription>(Collection.SUBSCRIPTIONS, SubscriptionSchemaMongo);
  const set: Record<string, unknown> = {
    provider: input.provider,
    updatedAt: new Date(),
    'metadata.lastBillingEventId': input.eventId,
    'metadata.lastBillingEventType': input.eventType,
    'metadata.lastBillingEventAt': new Date().toISOString(),
  };
  if (input.providerSubscriptionId) set.providerSubscriptionId = input.providerSubscriptionId;
  if (input.status) set.status = input.status;
  if (input.currentPeriodStartedAt) set.currentPeriodStartedAt = input.currentPeriodStartedAt;
  if (input.currentPeriodEndsAt) set.currentPeriodEndsAt = input.currentPeriodEndsAt;
  if (input.status === 'cancelled') set.cancelledAt = new Date().toISOString();

  return model.findOneAndUpdate(
    {
      organizationId: input.organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
      'metadata.processedBillingEventIds': { $ne: input.eventId },
    },
    {
      $set: set,
      $push: {
        'metadata.processedBillingEventIds': {
          $each: [input.eventId],
          $slice: -100,
        },
      },
    },
    { new: true },
  );
};
