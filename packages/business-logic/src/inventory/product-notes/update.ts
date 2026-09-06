import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductNoteSchemaMongo,
  type OrganizationId,
  type ProductId,
  type ProductNote,
  type ProductNoteId,
  type UserId,
} from '@hlb/contracts';

export const updateProductNote = async ({
  productId,
  noteId,
  organizationId,
  content,
  updatedBy,
}: {
  productId: ProductId;
  noteId: ProductNoteId;
  organizationId: OrganizationId;
  content: string;
  updatedBy: UserId;
}) => {
  const cleanContent = content.trim();
  if (!cleanContent) throw new Error('La nota no puede estar vacía.');
  const note = await getModel<ProductNote>(Collection.PRODUCT_NOTES, ProductNoteSchemaMongo)
    .findOneAndUpdate(
      { _id: noteId, productId, organizationId },
      { $set: { content: cleanContent, updatedBy } },
      { new: true, runValidators: true },
    );
  if (!note) throw new Error('La nota no existe o no pertenece a la organización.');
  return note;
};
