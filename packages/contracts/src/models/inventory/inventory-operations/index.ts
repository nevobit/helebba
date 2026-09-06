import { Schema } from 'mongoose';
import type {
  InventoryLotId,
  InventoryStockId,
  OrganizationId,
  PersistedEntity,
  ProductId,
  ProductionOrderId,
  StockTransferId,
  UserId,
  WarehouseId,
} from '../../../common';
import { baseFields, opts } from '../../../common';

export interface InventoryStock extends PersistedEntity<InventoryStockId, UserId> {
  productId: ProductId;
  variantId?: string;
  warehouseId: WarehouseId;
  quantity: number;
  reservedQuantity: number;
  inTransitQuantity: number;
}

export interface InventoryLot extends PersistedEntity<InventoryLotId, UserId> {
  productId: ProductId;
  variantId?: string;
  warehouseId: WarehouseId;
  lotNumber?: string;
  serialNumber?: string;
  quantity: number;
  manufacturedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface InventoryOperationLine {
  productId: ProductId;
  variantId?: string;
  quantity: number;
  lotNumber?: string;
  serialNumbers?: string[];
}

export type StockTransferStatus = 'draft' | 'in_transit' | 'completed' | 'cancelled';
export interface StockTransfer extends PersistedEntity<StockTransferId, UserId> {
  number: string;
  sourceWarehouseId: WarehouseId;
  destinationWarehouseId: WarehouseId;
  status: StockTransferStatus;
  lines: InventoryOperationLine[];
  notes?: string;
  shippedAt?: Date;
  receivedAt?: Date;
}

export type ProductionOrderStatus = 'draft' | 'planned' | 'in_progress' | 'completed' | 'cancelled';
export interface ProductionOrder extends PersistedEntity<ProductionOrderId, UserId> {
  number: string;
  warehouseId: WarehouseId;
  output: InventoryOperationLine;
  components: InventoryOperationLine[];
  status: ProductionOrderStatus;
  notes?: string;
  plannedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export const InventoryStockSchemaMongo = new Schema<InventoryStock>({
  ...baseFields,
  organizationId: { type: String, required: true, index: true },
  productId: { type: String, required: true, index: true },
  variantId: { type: String },
  warehouseId: { type: String, required: true, index: true },
  quantity: { type: Number, min: 0, default: 0 },
  reservedQuantity: { type: Number, min: 0, default: 0 },
  inTransitQuantity: { type: Number, min: 0, default: 0 },
  createdBy: String,
  updatedBy: String,
}, { ...opts });
InventoryStockSchemaMongo.index({ organizationId: 1, productId: 1, variantId: 1, warehouseId: 1 }, { unique: true });

export const InventoryLotSchemaMongo = new Schema<InventoryLot>({
  ...baseFields,
  organizationId: { type: String, required: true, index: true },
  productId: { type: String, required: true, index: true },
  variantId: String,
  warehouseId: { type: String, required: true, index: true },
  lotNumber: String,
  serialNumber: String,
  quantity: { type: Number, min: 0, required: true },
  manufacturedAt: Date,
  expiresAt: Date,
  metadata: Schema.Types.Mixed,
  createdBy: String,
  updatedBy: String,
}, { ...opts });
InventoryLotSchemaMongo.index({ organizationId: 1, productId: 1, warehouseId: 1, lotNumber: 1, serialNumber: 1 });

const lineSchema = new Schema<InventoryOperationLine>({
  productId: { type: String, required: true },
  variantId: String,
  quantity: { type: Number, min: 0.000001, required: true },
  lotNumber: String,
  serialNumbers: [String],
}, { _id: false });

export const StockTransferSchemaMongo = new Schema<StockTransfer>({
  ...baseFields,
  organizationId: { type: String, required: true, index: true },
  number: { type: String, required: true },
  sourceWarehouseId: { type: String, required: true },
  destinationWarehouseId: { type: String, required: true },
  status: { type: String, required: true, default: 'draft' },
  lines: { type: [lineSchema], required: true },
  notes: String,
  shippedAt: Date,
  receivedAt: Date,
  createdBy: String,
  updatedBy: String,
}, { ...opts });
StockTransferSchemaMongo.index({ organizationId: 1, number: 1 }, { unique: true });

export const ProductionOrderSchemaMongo = new Schema<ProductionOrder>({
  ...baseFields,
  organizationId: { type: String, required: true, index: true },
  number: { type: String, required: true },
  warehouseId: { type: String, required: true },
  output: { type: lineSchema, required: true },
  components: { type: [lineSchema], required: true },
  status: { type: String, required: true, default: 'draft' },
  notes: String,
  plannedAt: Date,
  startedAt: Date,
  completedAt: Date,
  createdBy: String,
  updatedBy: String,
}, { ...opts });
ProductionOrderSchemaMongo.index({ organizationId: 1, number: 1 }, { unique: true });

export type InventoryOperationScope = { organizationId: OrganizationId };
