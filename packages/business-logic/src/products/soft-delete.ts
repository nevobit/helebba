import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, type Product, type ProductId, ProductSchemaMongo } from '@hlb/contracts';

export const softDeleteProduct = async (productId: ProductId) => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const result = await model.updateOne(
    { _id: productId },
    { $set: { lifecycleStatus: LifecycleStatus.DELETED } },
  );

  if (!result.acknowledged && result.matchedCount < 1) throw new Error('Could not update product');

  const product = await model.findById(productId);

  return product;
};
