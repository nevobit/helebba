import { Collection, getModel } from '@hlb/constant-definitions';
import { CatalogSchemaMongo, LifecycleStatus, type Catalog, type OffsetPaginatedResult, type Params } from '@hlb/contracts';

export const listCatalogs = async (params: Params): Promise<OffsetPaginatedResult<Catalog>> => {
  const { organizationId, page = 1, limit = 100, search = '' } = params;
  const model = getModel<Catalog>(Collection.CATALOGS, CatalogSchemaMongo);
  const filter = {
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    ...(search.trim() ? { name: { $regex: search.trim(), $options: 'i' } } : {}),
  };
  const skip = (page - 1) * limit;
  const [items, count] = await Promise.all([
    model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    model.countDocuments(filter),
  ]);
  const pages = Math.ceil(count / limit);
  return { kind: 'offset', count, items, pageInfo: { page, pages, pageSize: limit, totalItems: count, hasPreviousPage: page > 1, hasNextPage: page < pages, previousPage: page > 1 ? page - 1 : null, nextPage: page < pages ? page + 1 : null } };
};
