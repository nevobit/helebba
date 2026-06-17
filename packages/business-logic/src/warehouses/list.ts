import { Collection, getModel } from '@hlb/constant-definitions';
import { type OffsetPaginatedResult, type Params, type Warehouse, WarehouseSchemaMongo } from '@hlb/contracts';

export const getAllWarehouses = async (params: Params): Promise<OffsetPaginatedResult<Warehouse>> => {
  const { page = 1, limit = 100, search = '', organizationId } = params;
  const model = getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo);
  const skip = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const filter = {
    organizationId,
    ...(normalizedSearch
      ? {
          $or: [
            { name: { $regex: normalizedSearch, $options: 'i' } },
            { email: { $regex: normalizedSearch, $options: 'i' } },
            { 'address.city': { $regex: normalizedSearch, $options: 'i' } },
          ],
        }
      : {}),
  };

  const warehouses = await model.find(filter).sort({ isDefault: -1, createdAt: -1 }).skip(skip).limit(limit);
  const total = await model.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  return {
    kind: 'offset',
    count: total,
    items: warehouses,
    pageInfo: {
      page,
      pages,
      pageSize: limit,
      totalItems: total,
      hasPreviousPage: page > 1,
      hasNextPage: page < pages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < pages ? page + 1 : null,
    },
  };
};
