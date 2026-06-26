import { createHttpClient } from './http';
import type {
  Category,
  HelebbaClient,
  HelebbaClientOptions,
  InventoryBrand,
  OffsetPaginatedResult,
  Product,
} from './types';

export const createHelebbaClient = (options: HelebbaClientOptions): HelebbaClient => {
  const http = createHttpClient(options);

  return {
    products: {
      list: (params = {}) =>
        http.get<OffsetPaginatedResult<Product>>('/products', { query: params }),
      get: (productId) => http.get<Product>(`/products/${encodeURIComponent(productId)}`),
    },
    brands: {
      list: (params = {}) =>
        http.get<OffsetPaginatedResult<InventoryBrand>>('/brands', { query: params }),
    },
    categories: {
      list: (params = {}) =>
        http.get<OffsetPaginatedResult<Category>>('/categories', { query: params }),
    },
  };
};
