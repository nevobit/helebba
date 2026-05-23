import { Collection, getModel } from "@hlb/constant-definitions";
import { PaginatedResult, Params, Warehouse, WarehouseSchemaMongo } from "@hlb/contracts";

export const getAllWarehouses = async (params: Params): Promise<PaginatedResult<Warehouse>> => {
    const {page = 1, limit = 10, search ="", tenantId} = params;

    const model = getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo);

    const skip = (page - 1) * limit;

    const warehouse = await model.find({ tenantId }).skip(skip).limit(limit);

    const total = await model.countDocuments({ tenantId });

    const pages = Math.ceil(total / limit);

    const hasPreviousPage = page > 1;
    const previousPage = hasPreviousPage ? page - 1 : null;
    const hasNextPage = page < pages;
    const nextPage = hasNextPage ? page + 1 : null;

       return {
    kind: 'offset',
    count: total,
    items: warehouse,
    pageInfo: {
      page,
      pages,
      pageSize: limit,
      totalItems: total,
      hasPreviousPage,
      hasNextPage,
      previousPage,
      nextPage,
    },
  };
}