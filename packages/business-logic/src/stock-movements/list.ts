import { Collection, getModel } from '@hlb/constant-definitions';
import {
  StockMovementSchemaMongo,
  type OrganizationId,
  type ProductId,
  type StockMovement,
} from '@hlb/contracts';

export const listStockMovements = async ({
  productId,
  organizationId,
  limit = 100,
}: {
  productId: ProductId;
  organizationId: OrganizationId;
  limit?: number;
}): Promise<StockMovement[]> => {
  const model = getModel<StockMovement>(Collection.STOCK_MOVEMENTS, StockMovementSchemaMongo);
  return model
    .find({ productId, organizationId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 500))
    .lean();
};