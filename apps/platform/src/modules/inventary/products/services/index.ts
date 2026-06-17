import { api } from '@/shared/api';
import type { OffsetPaginatedResult, Params, Product } from '@hlb/contracts';

export type ProductListParams = Params<{
  scope?: string;
}>;

export type CreateProductPayload = Partial<
  Pick<
    Product,
    | 'barcode'
    | 'brand'
    | 'categories'
    | 'cost'
    | 'description'
    | 'factoryCode'
    | 'forPurchase'
    | 'forSale'
    | 'hasStock'
    | 'images'
    | 'inCatalog'
    | 'name'
    | 'price'
    | 'purchasePrice'
    | 'sku'
    | 'stock'
    | 'tags'
    | 'taxes'
    | 'total'
    | 'variants'
    | 'warehouseId'
    | 'weight'
  >
>;

export const products = async (params: ProductListParams) => {
  const { data } = await api.get<OffsetPaginatedResult<Product>>('/products', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search?.trim() || undefined,
    },
  });

  return data;
};

export const createProduct = async (payload: CreateProductPayload) => {
  const { data } = await api.post<Product>('/products', payload);

  return data;
};

export const product = async (productId: string) => {
  const { data } = await api.get<Product>(`/products/${productId}`);

  return data;
};
