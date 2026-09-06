import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BrandSchemaMongo,
  LifecycleStatus,
  type BrandId,
  type InventoryBrand,
  type OrganizationId,
} from '@hlb/contracts';

export const getBrandById = async (brandId: BrandId, organizationId: OrganizationId) =>
  getModel<InventoryBrand>(Collection.BRANDS, BrandSchemaMongo).findOne({
    _id: brandId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
