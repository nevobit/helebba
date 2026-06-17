import { Collection, getModel } from '@hlb/constant-definitions';
import {
  createPlanSnapshot,
  SubscriptionSchemaMongo,
  type BillingInterval,
  type ISODateTimeString,
  type OrganizationId,
  type PlanCode,
  type Subscription,
  type UserId,
  LifecycleStatus,
} from '@hlb/contracts';

export interface CreateSubscriptionInput {
  organizationId: OrganizationId;
  planCode: PlanCode;
  interval?: BillingInterval;
  trialDays?: number;
  userId: UserId;
}

export const createOrganizationSubscription = async (input: CreateSubscriptionInput) => {
  const model = getModel<Subscription>(Collection.SUBSCRIPTIONS, SubscriptionSchemaMongo);

  const existing = await model.findOne({ organizationId: input.organizationId });

  if (existing) {
    throw new Error('Organization already has a subscription.');
  }

  const now = new Date();
  const trialDays = input.trialDays ?? 14;

  const plan = createPlanSnapshot({
    planCode: input.planCode,
    interval: input.interval ?? 'monthly',
  });

  const trialEndsAt = addDays(now, trialDays);

  const currentPeriodEndsAt =
    trialDays > 0 ? trialEndsAt : plan.interval === 'yearly' ? addOneYear(now) : addOneMonth(now);

  const subscription = await model.create({
    organizationId: input.organizationId,

    plan,

    status: trialDays > 0 ? 'trialing' : 'active',

    trialStartedAt: trialDays > 0 ? (now.toISOString() as ISODateTimeString) : undefined,
    trialEndsAt: trialDays > 0 ? (trialEndsAt.toISOString() as ISODateTimeString) : undefined,

    currentPeriodStartedAt: now.toISOString() as ISODateTimeString,
    currentPeriodEndsAt: currentPeriodEndsAt.toISOString() as ISODateTimeString,

    provider: 'manual',

    createdBy: input.userId,
    updatedBy: input.userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  return subscription;
};

function addOneMonth(date: Date) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addOneYear(date: Date) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + 1);
  return result;
}
