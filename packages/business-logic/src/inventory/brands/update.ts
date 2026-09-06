import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BrandSchemaMongo,
  LifecycleStatus,
  type BrandId,
  type InventoryBrand,
  type OrganizationId,
} from '@hlb/contracts';
import { slugify } from '@hlb/foundation';

export const updateBrand = async (
  brandId: BrandId,
  organizationId: OrganizationId,
  data: Partial<InventoryBrand>,
) => {
  const model = getModel<InventoryBrand>(Collection.BRANDS, BrandSchemaMongo);
  const current = await model.findOne({
    _id: brandId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!current) throw new Error('La marca no existe o no pertenece a la organización.');

  const name = data.name?.trim() ?? current.name;
  if (!name) throw new Error('Ingresa el nombre de la marca.');
  const parentId = data.parentId === undefined ? current.parentId : data.parentId || null;
  if (parentId && String(parentId) === String(brandId)) {
    throw new Error('Una marca no puede ser su propia marca padre.');
  }

  const updated = await model.findOneAndUpdate(
    { _id: brandId, organizationId },
    {
      $set: {
        ...data,
        name,
        slug: data.slug?.trim() || slugify(name),
        parentId,
      },
    },
    { new: true, runValidators: true },
  );
  if (!updated) throw new Error('No pudimos actualizar la marca.');
  return updated;
};
