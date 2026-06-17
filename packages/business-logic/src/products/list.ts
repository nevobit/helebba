import { Collection, getModel } from '@hlb/constant-definitions';
import {
  type PaginatedResult,
  type Params,
  type Product,
  ProductSchemaMongo,
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

  const total = await model.countDocuments(filter);

  const pages = Math.ceil(total / limit);

  const hasPreviousPage = page > 1;
  const previousPage = hasPreviousPage ? page - 1 : null;
  const hasNextPage = page < pages;
  const nextPage = hasNextPage ? page + 1 : null;

  return {
    kind: 'offset',
    count: total,
    items: products,
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
