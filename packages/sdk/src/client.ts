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
        http.get<OffsetPaginatedResult<Product>>('/sdk/products', { query: params }),
      get: (productId) => http.get<Product>(`/sdk/products/${encodeURIComponent(productId)}`),
    },
    brands: {
      list: (params = {}) =>
        http.get<OffsetPaginatedResult<InventoryBrand>>('/sdk/brands', { query: params }),
    },
    categories: {
      list: (params = {}) =>
        http.get<OffsetPaginatedResult<Category>>('/sdk/categories', { query: params }),
    },
  };
};
