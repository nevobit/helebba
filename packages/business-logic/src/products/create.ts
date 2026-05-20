import { type Product, ProductSchemaMongo } from '@hlb/contracts';
import { getModel, Collection } from '@hlb/constant-definitions';

export const createProduct = async (data: Product): Promise<Product> => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const product = new model(data);
  const createdProduct = await product.save();
  return createdProduct;
};
