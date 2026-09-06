import { Collection, getModel } from '@hlb/constant-definitions';
import { CatalogSchemaMongo, LifecycleStatus, type Catalog, type CatalogId, type OrganizationId, type UserId } from '@hlb/contracts';

export const deleteCatalog = async (catalogId: CatalogId, organizationId: OrganizationId, userId: UserId) => {
  const model = getModel<Catalog>(Collection.CATALOGS, CatalogSchemaMongo);
  const result = await model.updateOne(
    { _id: catalogId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    { $set: { lifecycleStatus: LifecycleStatus.DELETED, deletedAt: new Date(), deletedBy: userId, updatedBy: userId } },
  );
  if (!result.matchedCount) throw new Error('Catálogo no encontrado.');
  return true;
};
