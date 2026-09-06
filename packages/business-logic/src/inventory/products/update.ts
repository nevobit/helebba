import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductSchemaMongo,
  LifecycleStatus,
  type OrganizationId,
  type Product,
  type ProductId,
} from '@hlb/contracts';
import { prepareProductData } from './create';

export const updateProduct = async (
  productId: ProductId,
  organizationId: OrganizationId,
  data: Partial<Product>,
) => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const existingProduct = await model.findOne({
    _id: productId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!existingProduct) throw new Error('El producto no existe o no pertenece a la organización.');

  const mergedData = {
    ...existingProduct.toObject(),
    ...data,
    organizationId,
  } as Partial<Product>;
  const editableData = { ...(await prepareProductData(mergedData, productId)) } as Record<string, unknown>;
  delete editableData._id;
  delete editableData.id;
  delete editableData.__v;
  delete editableData.createdAt;
  delete editableData.createdBy;

  const product = await model.findOneAndUpdate(
    { _id: productId, organizationId },
    { $set: { ...editableData, updatedAt: new Date() } },
    { new: true, runValidators: true },
  );
  if (!product) throw new Error('No pudimos actualizar el producto.');
  return product;
};
