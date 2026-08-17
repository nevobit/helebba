import { Collection, getModel } from '@hlb/constant-definitions';
import {
  type PaginatedResult,
  type Params,
  type Product,
  ProductSchemaMongo,
  type Warehouse,
  WarehouseSchemaMongo,
} from '@hlb/contracts';

export const getAllProducts = async (params: Params): Promise<PaginatedResult<Product>> => {
  const { page = 1, limit = 100, search = '', organizationId } = params;
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);

  const skip = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const searchFilter = normalizedSearch
    ? {
        $or: [
          { name: { $regex: normalizedSearch, $options: 'i' } },
          { description: { $regex: normalizedSearch, $options: 'i' } },
          { sku: { $regex: normalizedSearch, $options: 'i' } },
        ],
      }
    : {};
  const filter = { organizationId, ...searchFilter };

  const products = await model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const warehouseIds = [...new Set(products.flatMap((product) => product.warehouseId ? [String(product.warehouseId)] : []))];
  const warehouses = warehouseIds.length
    ? await getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo).find({
        _id: { $in: warehouseIds },
        organizationId,
      }).select({ name: 1 })
    : [];
  const warehouseNames = new Map(warehouses.map((warehouse) => [String(warehouse.id), warehouse.name]));
  const items = products.map((product) => ({
    ...product.toObject(),
    warehouseName: product.warehouseId ? warehouseNames.get(String(product.warehouseId)) : undefined,
  })) as Product[];

  const total = await model.countDocuments(filter);

  const pages = Math.ceil(total / limit);

  const hasPreviousPage = page > 1;
  const previousPage = hasPreviousPage ? page - 1 : null;
  const hasNextPage = page < pages;
  const nextPage = hasNextPage ? page + 1 : null;

  return {
    kind: 'offset',
    count: total,
    items,
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
};
