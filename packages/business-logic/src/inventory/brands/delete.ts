import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BrandSchemaMongo,
  LifecycleStatus,
  ProductSchemaMongo,
  type BrandId,
  type InventoryBrand,
  type OrganizationId,
  type Product,
  type UserId,
} from '@hlb/contracts';

export const deleteBrand = async (
  brandId: BrandId,
  organizationId: OrganizationId,
  deletedBy: UserId,
) => {
  const model = getModel<InventoryBrand>(Collection.BRANDS, BrandSchemaMongo);
  const brand = await model.findOne({
    _id: brandId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!brand) throw new Error('La marca no existe o ya fue eliminada.');

  const [hasChildren, hasProducts] = await Promise.all([
    model.exists({ organizationId, parentId: brandId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } }),
    getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo).exists({
      organizationId,
      brandId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    }),
  ]);
  if (hasChildren) throw new Error('No puedes eliminar una marca que tiene submarcas.');
  if (hasProducts) throw new Error('No puedes eliminar una marca asignada a productos.');

  brand.lifecycleStatus = LifecycleStatus.DELETED;
  brand.deletedAt = new Date();
  brand.deletedBy = deletedBy;
  brand.updatedBy = deletedBy;
  await brand.save();
  return brand;
};
