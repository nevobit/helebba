import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BillingForecastSchemaMongo,
  LifecycleStatus,
  RemittanceSchemaMongo,
  type BillingForecast,
  type BillingForecastId,
  type OrganizationId,
  type Remittance,
  type RemittanceId,
  type UserId,
} from '@hlb/contracts';

const active = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: LifecycleStatus.ACTIVE,
});

export const listRemittances = async (organizationId: OrganizationId) =>
  getModel<Remittance>(Collection.REMITTANCES, RemittanceSchemaMongo)
    .find(active(organizationId))
    .sort({ createdAt: -1 });

export const getRemittance = async (id: RemittanceId, organizationId: OrganizationId) =>
  getModel<Remittance>(Collection.REMITTANCES, RemittanceSchemaMongo).findOne({
    _id: id,
    ...active(organizationId),
  });

export const createRemittance = async (data: Partial<Remittance>) =>
  new (getModel<Remittance>(Collection.REMITTANCES, RemittanceSchemaMongo))({
    ...data,
    status: data.status ?? 'draft',
    type: data.type ?? 'collection',
    currency: data.currency ?? 'EUR',
    paymentIds: data.paymentIds ?? [],
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  }).save();

export const listBillingForecasts = async (organizationId: OrganizationId) =>
  getModel<BillingForecast>(Collection.BILLING_FORECASTS, BillingForecastSchemaMongo)
    .find(active(organizationId))
    .sort({ forecastDate: 1 });

export const getBillingForecast = async (id: BillingForecastId, organizationId: OrganizationId) =>
  getModel<BillingForecast>(Collection.BILLING_FORECASTS, BillingForecastSchemaMongo).findOne({
    _id: id,
    ...active(organizationId),
  });

export const createBillingForecast = async (data: Partial<BillingForecast>) =>
  new (getModel<BillingForecast>(Collection.BILLING_FORECASTS, BillingForecastSchemaMongo))({
    ...data,
    direction: data.direction ?? 'receivable',
    status: data.status ?? 'pending',
    currency: data.currency ?? 'EUR',
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  }).save();

export const updateBillingForecast = async (
  id: BillingForecastId,
  organizationId: OrganizationId,
  userId: UserId,
  data: Partial<BillingForecast>,
) =>
  getModel<BillingForecast>(Collection.BILLING_FORECASTS, BillingForecastSchemaMongo).findOneAndUpdate(
    { _id: id, ...active(organizationId) },
    { $set: { ...data, _id: undefined, organizationId, updatedBy: userId } },
    { new: true },
  );

export const deleteBillingForecast = async (
  id: BillingForecastId,
  organizationId: OrganizationId,
  userId: UserId,
) =>
  getModel<BillingForecast>(Collection.BILLING_FORECASTS, BillingForecastSchemaMongo).findOneAndUpdate(
    { _id: id, ...active(organizationId) },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
      },
    },
    { new: true },
  );
