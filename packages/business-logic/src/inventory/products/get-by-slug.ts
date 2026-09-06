import { Collection, getModel } from '@hlb/constant-definitions';
import { ProductSchemaMongo, type OrganizationId, type Product } from '@hlb/contracts';

export const getProductBySlug = async (organizationId: OrganizationId, slug: string) => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const product = await model.findOne({ organizationId, slug });
  return product;
};
