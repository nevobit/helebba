import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductNoteSchemaMongo,
  type OrganizationId,
  type ProductId,
  type ProductNote,
  type UserId,
} from '@hlb/contracts';

export const createProductNote = async ({
  productId,
  organizationId,
  content,
  createdBy,
}: {
  productId: ProductId;
  organizationId: OrganizationId;
  content: string;
  createdBy: UserId;
}): Promise<ProductNote> => {
  if (!content.trim()) throw new Error('La nota no puede estar vacía.');

  const model = getModel<ProductNote>(Collection.PRODUCT_NOTES, ProductNoteSchemaMongo);
  const note = new model({
    productId,
    organizationId,
    content: content.trim(),
    createdBy,
    updatedBy: createdBy,
  });
  return note.save();
};