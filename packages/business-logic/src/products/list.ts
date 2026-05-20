import { Collection, getModel } from '@hlb/constant-definitions';
import { PaginatedResult, Params, Product, ProductSchemaMongo } from '@hlb/contracts';

/*
page: Pagina que quiero mostrar
limit: Cantidad de items por pagina
search: Texto para filtrar los productos por nombre
tenantId: Id del tenant al que pertenecen los productos
*/
export const getAllProducts = async (params: Params): Promise<PaginatedResult<Product>> => {
  const { page = 1, limit = 3, search = '', tenantId } = params;
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);

  const skip = (page - 1) * limit; // 0, 10, 20, 30, ...

  const products = await model.find({ tenantId }).skip(skip).limit(limit);

  const total = await model.countDocuments({ tenantId });

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
