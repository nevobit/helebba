import type { BillingInterval, PlanCode, SubscriptionPlanSnapshot } from './subscription';

export const SUBSCRIPTION_PLANS: Record<PlanCode, Omit<SubscriptionPlanSnapshot, 'interval'>> = {
  plus: {
    code: 'plus',
    name: 'Plus',
    price: 19500,
    currency: 'COP',
    limits: {
      users: 2,
      branches: 1,
      invoicesPerMonth: 50,
      storageGB: 1,
    },
  },

  basic: {
    code: 'basic',
    name: 'Basic',
    price: 36500,
    currency: 'COP',
    limits: {
      users: 5,
      branches: 2,
      invoicesPerMonth: 200,
      storageGB: 5,
    },
  },

  standard: {
    code: 'standard',
    name: 'Business',
    price: 69500,
    currency: 'COP',
    limits: {
      users: 15,
      branches: 5,
      invoicesPerMonth: 1000,
      storageGB: 20,
    },
  },

  advanced: {
    code: 'advanced',
    name: 'Enterprise',
    price: 135500,
    currency: 'COP',
    limits: {
      users: 999,
      branches: 999,
      invoicesPerMonth: 999999,
      storageGB: 999,
    },
  },
  premium: {
    code: 'premium',
    name: 'Premium',
    price: 247500,
    currency: 'COP',
    limits: {
      users: 999,
      branches: 999,
      invoicesPerMonth: 999999,
      storageGB: 999,
    },
  },
  accounting: {
    code: 'accounting',
    name: 'Accounting',
    price: 0,
    currency: 'COP',
    limits: {
      users: 999,
      branches: 999,
      invoicesPerMonth: 999999,
      storageGB: 999,
    },
  },
};

export function createPlanSnapshot(params: {
  planCode: PlanCode;
  interval?: BillingInterval;
}): SubscriptionPlanSnapshot {
  const plan = SUBSCRIPTION_PLANS[params.planCode];

  if (!plan) {
    throw new Error('Invalid subscription plan');
  }

  return {
    ...plan,
    interval: params.interval ?? 'monthly',
  };
}
