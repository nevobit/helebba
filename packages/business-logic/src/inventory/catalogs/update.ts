import { Collection, getModel } from '@hlb/constant-definitions';
import { CatalogSchemaMongo, LifecycleStatus, type Catalog, type CatalogId, type OrganizationId } from '@hlb/contracts';
import { slugify } from '@hlb/foundation';
import { validateCatalogProducts } from './create';

export const updateCatalog = async (catalogId: CatalogId, organizationId: OrganizationId, data: Partial<Catalog>) => {
  const model = getModel<Catalog>(Collection.CATALOGS, CatalogSchemaMongo);
  const current = await model.findOne({ _id: catalogId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } });
  if (!current) throw new Error('Catálogo no encontrado.');
  const merged = { ...current.toObject(), ...data, organizationId } as Partial<Catalog>;
  const name = merged.name?.trim();
  if (!name) throw new Error('Ingresa el nombre del catálogo.');
  const productIds = await validateCatalogProducts(merged);
  return model.findOneAndUpdate(
    { _id: catalogId, organizationId },
    { $set: { name, slug: slugify(name), active: merged.active, selectionMode: merged.selectionMode, productIds: merged.selectionMode === 'specific' ? productIds : [], sortOrder: merged.sortOrder, settings: merged.settings, updatedBy: data.updatedBy } },
    { new: true, runValidators: true },
  );
};
