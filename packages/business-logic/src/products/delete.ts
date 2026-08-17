import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  ProductSchemaMongo,
  type OrganizationId,
  type Product,
  type ProductId,
  type UserId,
} from '@hlb/contracts';

export const deleteProduct = async (
  productId: ProductId,
  organizationId: OrganizationId,
  deletedBy: UserId,
) => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const product = await model.findOneAndUpdate(
    { _id: productId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    },
    { new: true },
  );
  if (!product) throw new Error('El producto no existe o ya fue eliminado.');
  return true;
};
