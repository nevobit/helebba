import { Collection, getModel } from '@hlb/constant-definitions';
import { ProductSchemaMongo, type OrganizationId, type Product, type ProductId } from '@hlb/contracts';

export const getProductById = async (productId: ProductId, organizationId?: OrganizationId) => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const product = await model.findOne({ _id: productId, ...(organizationId ? { organizationId } : {}) });
  return product;
};
