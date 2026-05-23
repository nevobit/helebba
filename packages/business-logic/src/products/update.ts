import { Collection, getModel } from '@hlb/constant-definitions';
import { type Product, type ProductId, ProductSchemaMongo } from '@hlb/contracts';

export const updateProduct = async (productId: ProductId, data: Partial<Product>) => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);

  const dataToUpdate = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const result = await model.updateOne({ _id: productId }, { $set: dataToUpdate });

  if (!result.acknowledged && result.matchedCount < 1) throw new Error('Could not update product');

  const product = await model.findById(productId);

  return product;
};
