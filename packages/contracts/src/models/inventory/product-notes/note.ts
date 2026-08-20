import type { PersistedEntity, ProductId, ProductNoteId, UserId } from '../../../common';

export interface ProductNote extends PersistedEntity<ProductNoteId, UserId> {
  productId: ProductId;
  content: string;
  createdBy: UserId;
  updatedBy: UserId;
}