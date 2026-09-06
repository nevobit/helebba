import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductNoteSchemaMongo,
  type OrganizationId,
  type ProductNote,
  type ProductNoteId,
} from '@hlb/contracts';

export const deleteProductNote = async ({
  noteId,
  organizationId,
}: {
  noteId: ProductNoteId;
  organizationId: OrganizationId;
}): Promise<boolean> => {
  const model = getModel<ProductNote>(Collection.PRODUCT_NOTES, ProductNoteSchemaMongo);
  const result = await model.deleteOne({ _id: noteId, organizationId });
  if (!result.deletedCount) throw new Error('La nota no existe o no pertenece a la organización.');
  return true;
};