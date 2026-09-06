import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductNoteSchemaMongo,
  type OrganizationId,
  type ProductId,
  type ProductNote,
  type ProductNoteId,
} from '@hlb/contracts';

export const getProductNote = async ({
  productId,
  noteId,
  organizationId,
}: {
  productId: ProductId;
  noteId: ProductNoteId;
  organizationId: OrganizationId;
}) =>
  getModel<ProductNote>(Collection.PRODUCT_NOTES, ProductNoteSchemaMongo)
    .findOne({ _id: noteId, productId, organizationId })
    .lean();
