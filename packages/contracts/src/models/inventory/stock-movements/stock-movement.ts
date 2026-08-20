import type { PersistedEntity, ProductId, StockMovementId, UserId, WarehouseId } from '../../../common';

export const StockMovementType = {
  IN: 'in',
  OUT: 'out',
  ADJUSTMENT: 'adjustment',
} as const;

export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export interface StockMovement extends PersistedEntity<StockMovementId, UserId> {
  productId: ProductId;
  variantId?: string;
  warehouseId?: WarehouseId;
  type: StockMovementType;
  quantity: number;
  reason: string;
  reference?: string;
  previousStock: number;
  newStock: number;
  createdBy: UserId;
}