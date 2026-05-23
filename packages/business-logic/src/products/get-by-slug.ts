import { Collection, getModel } from '@hlb/constant-definitions';
import { ProductSchemaMongo, type CompanyId, type Product, type ProductId } from '@hlb/contracts';

export const getProductBySlug = async (companyId: CompanyId, slug: string) => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const product = await model.findOne({ companyId, slug });
  return product;
};
