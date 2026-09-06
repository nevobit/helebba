import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, PriceListSchemaMongo, type OrganizationId, type PriceList, type PriceListId, type UserId } from '@hlb/contracts';

export const deletePriceList = async (priceListId: PriceListId, organizationId: OrganizationId, deletedBy: UserId) =>
  getModel<PriceList>(Collection.PRICE_LISTS, PriceListSchemaMongo).findOneAndUpdate(
    { _id: priceListId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    { $set: { lifecycleStatus: LifecycleStatus.DELETED, deletedAt: new Date(), deletedBy, updatedBy: deletedBy } },
    { new: true },
  );
