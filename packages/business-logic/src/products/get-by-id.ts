import { Collection, getModel } from '@hlb/constant-definitions';
import { ProductSchemaMongo, type Product, type ProductId } from '@hlb/contracts';

export const getProductById = async (productId: ProductId) => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const product = await model.findById(productId);
  return product;
};
