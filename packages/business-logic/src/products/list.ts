import { Collection, getModel } from '@hlb/constant-definitions';
import {
  type PaginatedResult,
  type Params,
  type Product,
  ProductSchemaMongo,
} from '@hlb/contracts';

export const getAllProducts = async (params: Params): Promise<PaginatedResult<Product>> => {
  const { page = 1, limit = 3, search = '', organizationId } = params;
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);

  const skip = (page - 1) * limit;

  const products = await model.find({ organizationId }).skip(skip).limit(limit);

  const total = await model.countDocuments({ organizationId });

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
