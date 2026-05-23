import { Collection, getModel } from '@hlb/constant-definitions';
import { type ProductId, ProductSchemaMongo } from '@hlb/contracts';

export const deleteProduct = async (productId: ProductId) => {
  const model = getModel(Collection.PRODUCTS, ProductSchemaMongo);
  const result = await model.deleteOne(productId);
  if (!result.acknowledged) throw new Error('Could not delete product');
  return result.deletedCount > 0;
};
