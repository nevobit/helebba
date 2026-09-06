import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, PriceListSchemaMongo, type OrganizationId, type PriceList, type PriceListId } from '@hlb/contracts';

export const getPriceListById = async (priceListId: PriceListId, organizationId: OrganizationId) =>
  getModel<PriceList>(Collection.PRICE_LISTS, PriceListSchemaMongo).findOne({
    _id: priceListId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
