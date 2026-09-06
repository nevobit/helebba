import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductNoteSchemaMongo,
  type OrganizationId,
  type ProductId,
  type ProductNote,
} from '@hlb/contracts';

export const listProductNotes = async ({
  productId,
  organizationId,
}: {
  productId: ProductId;
  organizationId: OrganizationId;
}): Promise<ProductNote[]> => {
  const model = getModel<ProductNote>(Collection.PRODUCT_NOTES, ProductNoteSchemaMongo);
  return model
    .find({ productId, organizationId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
};