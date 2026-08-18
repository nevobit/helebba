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
    | 'categoryId'
    | 'cost'
    | 'customFields'
    | 'description'
    | 'factoryCode'
    | 'forPurchase'
    | 'forSale'
    | 'hasStock'
    | 'images'
    | 'inCatalog'
    | 'inPos'
    | 'name'
    | 'price'
    | 'purchasePrice'
    | 'sku'
    | 'stock'
    | 'tags'
    | 'taxes'
    | 'taxRate'
    | 'total'
    | 'variants'
    | 'warehouseId'
    | 'weight'
    | 'contactId'
    | 'contactName'
    | 'forProduction'
    | 'manageLots'
    | 'manageSerials'
    | 'salesAccountId'
    | 'purchaseAccountId'
    | 'kind'
    | 'stockState'
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

export const updateProduct = async (productId: string, payload: CreateProductPayload) => {
  const { data } = await api.patch<Product>(`/products/${productId}`, payload);
  return data;
};

export const deleteProduct = async (productId: string) => {
  const { data } = await api.delete<boolean>(`/products/${productId}`);
  return data;
};

export const product = async (productId: string) => {
  const { data } = await api.get<Product>(`/products/${productId}`);

  return data;
};
