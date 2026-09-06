import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  InventoryLotSchemaMongo,
  InventoryStockSchemaMongo,
  LifecycleStatus,
  ProductionOrderSchemaMongo,
  ProductSchemaMongo,
  StockTransferSchemaMongo,
  type InventoryLot,
  type InventoryOperationLine,
  type InventoryStock,
  type OrganizationId,
  type ProductionOrder,
  type ProductionOrderId,
  type Product,
  type ProductId,
  type StockTransfer,
  type StockTransferId,
  type UserId,
  type WarehouseId,
} from '@hlb/contracts';

type StockField = 'quantity' | 'reservedQuantity' | 'inTransitQuantity';
type LotInput = Omit<Partial<InventoryLot>, 'organizationId' | 'createdBy' | 'updatedBy'> & {
  productId: ProductId;
  warehouseId: WarehouseId;
  quantity: number;
};
type TransferInput = Omit<Partial<StockTransfer>, 'organizationId' | 'createdBy' | 'updatedBy' | 'status'> & {
  sourceWarehouseId: WarehouseId;
  destinationWarehouseId: WarehouseId;
  lines: InventoryOperationLine[];
};
type ProductionInput = Omit<Partial<ProductionOrder>, 'organizationId' | 'createdBy' | 'updatedBy' | 'status'> & {
  warehouseId: WarehouseId;
  output: InventoryOperationLine;
  components: InventoryOperationLine[];
};

const stockModel = () => getModel<InventoryStock>(Collection.INVENTORY_STOCK, InventoryStockSchemaMongo);
const lotModel = () => getModel<InventoryLot>(Collection.INVENTORY_LOTS, InventoryLotSchemaMongo);
const transferModel = () => getModel<StockTransfer>(Collection.STOCK_TRANSFERS, StockTransferSchemaMongo);
const productionModel = () => getModel<ProductionOrder>(Collection.PRODUCTION_ORDERS, ProductionOrderSchemaMongo);

const activeScope = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: LifecycleStatus.ACTIVE,
});

const variantFilter = (variantId?: string) =>
  variantId ? { variantId } : { $or: [{ variantId: { $exists: false } }, { variantId: null }, { variantId: '' }] };

const assertLine = (line: InventoryOperationLine, label = 'línea') => {
  if (!line?.productId) throw new Error(`El producto de la ${label} es obligatorio.`);
  if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
    throw new Error(`La cantidad de la ${label} debe ser mayor que cero.`);
  }
};

const assertLines = (lines: InventoryOperationLine[], label: string) => {
  if (!Array.isArray(lines) || lines.length === 0) throw new Error(`Debe incluir al menos una ${label}.`);
  lines.forEach((line, index) => assertLine(line, `${label} ${index + 1}`));
};

const syncProductStock = async (organizationId: OrganizationId, productId: ProductId) => {
  const entries = await stockModel().find({ ...activeScope(organizationId), productId }).lean();
  const product = await getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo).findOne({
    _id: productId,
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
  if (!product) throw new Error('El producto no existe o no pertenece a la organización.');

  const stockByVariant = new Map<string, number>();
  let stockWithoutVariant = 0;
  for (const entry of entries) {
    if (entry.variantId) {
      stockByVariant.set(entry.variantId, (stockByVariant.get(entry.variantId) ?? 0) + Number(entry.quantity ?? 0));
    } else {
      stockWithoutVariant += Number(entry.quantity ?? 0);
    }
  }

  const variants = (product.variants ?? []).map((variant) => ({
    ...variant,
    stock: stockByVariant.get(String(variant.id)) ?? 0,
  }));
  const total = variants.length > 0
    ? variants.reduce((sum, variant) => sum + Number(variant.stock ?? 0), 0)
    : stockWithoutVariant;

  await product.updateOne({ $set: { variants, stock: total, updatedAt: new Date() } });
};

const changeStock = async (
  organizationId: OrganizationId,
  userId: UserId,
  warehouseId: WarehouseId,
  line: InventoryOperationLine,
  field: StockField,
  delta: number,
) => {
  const query = {
    ...activeScope(organizationId),
    productId: line.productId,
    warehouseId,
    ...variantFilter(line.variantId),
    ...(delta < 0 ? { [field]: { $gte: Math.abs(delta) } } : {}),
  };
  const update = {
    $inc: { [field]: delta },
    $set: { updatedBy: userId },
    $setOnInsert: {
      organizationId,
      productId: line.productId,
      ...(line.variantId ? { variantId: line.variantId } : {}),
      warehouseId,
      quantity: 0,
      reservedQuantity: 0,
      inTransitQuantity: 0,
      createdBy: userId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
  };
  const result = await stockModel().findOneAndUpdate(query, update, {
    new: true,
    upsert: delta > 0,
    runValidators: true,
  });
  if (!result) throw new Error(`Stock insuficiente para el producto ${String(line.productId)}.`);
  await syncProductStock(organizationId, line.productId);
  return result;
};

const reverseChanges = async (
  changes: Array<{ warehouseId: WarehouseId; line: InventoryOperationLine; field: StockField; delta: number }>,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  for (const change of [...changes].reverse()) {
    await changeStock(organizationId, userId, change.warehouseId, change.line, change.field, -change.delta);
  }
};

const applyChanges = async (
  changes: Array<{ warehouseId: WarehouseId; line: InventoryOperationLine; field: StockField; delta: number }>,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const applied: typeof changes = [];
  try {
    for (const change of changes) {
      await changeStock(organizationId, userId, change.warehouseId, change.line, change.field, change.delta);
      applied.push(change);
    }
  } catch (error) {
    await reverseChanges(applied, organizationId, userId);
    throw error;
  }
};

export const listInventoryStock = async (organizationId: OrganizationId, warehouseId?: WarehouseId) =>
  stockModel()
    .find({ ...activeScope(organizationId), ...(warehouseId ? { warehouseId } : {}) })
    .sort({ productId: 1, variantId: 1, warehouseId: 1 });

export const listInventoryLots = async (
  organizationId: OrganizationId,
  filters: { productId?: string; warehouseId?: string } = {},
) => lotModel().find({ ...activeScope(organizationId), ...filters }).sort({ expiresAt: 1, createdAt: -1 });

export const createInventoryLot = async (organizationId: OrganizationId, userId: UserId, input: LotInput) => {
  assertLine(input as InventoryOperationLine, 'lote');
  if (!input.warehouseId) throw new Error('El almacén del lote es obligatorio.');
  if (!input.lotNumber && !input.serialNumber) throw new Error('El lote requiere un número de lote o de serie.');

  const lot = await new (lotModel())({
    ...input,
    organizationId,
    createdBy: userId,
    updatedBy: userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  }).save();
  try {
    await changeStock(organizationId, userId, input.warehouseId, input as InventoryOperationLine, 'quantity', input.quantity);
  } catch (error) {
    await lot.deleteOne();
    throw error;
  }
  return lot;
};

export const listStockTransfers = async (organizationId: OrganizationId) =>
  transferModel().find(activeScope(organizationId)).sort({ createdAt: -1 });

export const getStockTransfer = async (organizationId: OrganizationId, transferId: StockTransferId) =>
  transferModel().findOne({ _id: transferId, ...activeScope(organizationId) });

export const createStockTransfer = async (organizationId: OrganizationId, userId: UserId, input: TransferInput) => {
  if (!input.sourceWarehouseId || !input.destinationWarehouseId) throw new Error('Los almacenes de origen y destino son obligatorios.');
  if (String(input.sourceWarehouseId) === String(input.destinationWarehouseId)) {
    throw new Error('Los almacenes de origen y destino deben ser diferentes.');
  }
  assertLines(input.lines, 'línea');
  return new (transferModel())({
    ...input,
    number: input.number?.trim() || `TR-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
    organizationId,
    status: 'draft',
    createdBy: userId,
    updatedBy: userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  }).save();
};

const requireTransfer = async (organizationId: OrganizationId, transferId: StockTransferId) => {
  const transfer = await getStockTransfer(organizationId, transferId);
  if (!transfer) throw new Error('Transferencia no encontrada.');
  return transfer;
};

export const shipStockTransfer = async (organizationId: OrganizationId, userId: UserId, transferId: StockTransferId) => {
  const transfer = await requireTransfer(organizationId, transferId);
  if (transfer.status !== 'draft') throw new Error('Solo se pueden enviar transferencias en borrador.');
  await applyChanges(
    transfer.lines.flatMap((line) => [
      { warehouseId: transfer.sourceWarehouseId, line, field: 'quantity' as const, delta: -line.quantity },
      { warehouseId: transfer.destinationWarehouseId, line, field: 'inTransitQuantity' as const, delta: line.quantity },
    ]),
    organizationId,
    userId,
  );
  transfer.status = 'in_transit';
  transfer.shippedAt = new Date();
  transfer.updatedBy = userId;
  return transfer.save();
};

export const receiveStockTransfer = async (organizationId: OrganizationId, userId: UserId, transferId: StockTransferId) => {
  const transfer = await requireTransfer(organizationId, transferId);
  if (transfer.status !== 'in_transit') throw new Error('Solo se pueden recibir transferencias en tránsito.');
  await applyChanges(
    transfer.lines.flatMap((line) => [
      { warehouseId: transfer.destinationWarehouseId, line, field: 'inTransitQuantity' as const, delta: -line.quantity },
      { warehouseId: transfer.destinationWarehouseId, line, field: 'quantity' as const, delta: line.quantity },
    ]),
    organizationId,
    userId,
  );
  transfer.status = 'completed';
  transfer.receivedAt = new Date();
  transfer.updatedBy = userId;
  return transfer.save();
};

export const cancelStockTransfer = async (organizationId: OrganizationId, userId: UserId, transferId: StockTransferId) => {
  const transfer = await requireTransfer(organizationId, transferId);
  if (transfer.status === 'completed' || transfer.status === 'cancelled') {
    throw new Error('La transferencia ya no se puede cancelar.');
  }
  if (transfer.status === 'in_transit') {
    await applyChanges(
      transfer.lines.flatMap((line) => [
        { warehouseId: transfer.destinationWarehouseId, line, field: 'inTransitQuantity' as const, delta: -line.quantity },
        { warehouseId: transfer.sourceWarehouseId, line, field: 'quantity' as const, delta: line.quantity },
      ]),
      organizationId,
      userId,
    );
  }
  transfer.status = 'cancelled';
  transfer.updatedBy = userId;
  return transfer.save();
};

export const listProductionOrders = async (organizationId: OrganizationId) =>
  productionModel().find(activeScope(organizationId)).sort({ createdAt: -1 });

export const getProductionOrder = async (organizationId: OrganizationId, productionOrderId: ProductionOrderId) =>
  productionModel().findOne({ _id: productionOrderId, ...activeScope(organizationId) });

export const createProductionOrder = async (organizationId: OrganizationId, userId: UserId, input: ProductionInput) => {
  if (!input.warehouseId) throw new Error('El almacén de producción es obligatorio.');
  assertLine(input.output, 'producto de salida');
  assertLines(input.components, 'componente');
  return new (productionModel())({
    ...input,
    number: input.number?.trim() || `PO-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
    organizationId,
    status: input.plannedAt ? 'planned' : 'draft',
    createdBy: userId,
    updatedBy: userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  }).save();
};

const requireProductionOrder = async (organizationId: OrganizationId, productionOrderId: ProductionOrderId) => {
  const order = await getProductionOrder(organizationId, productionOrderId);
  if (!order) throw new Error('Orden de producción no encontrada.');
  return order;
};

export const updateProductionOrder = async (
  organizationId: OrganizationId,
  userId: UserId,
  productionOrderId: ProductionOrderId,
  input: Partial<ProductionOrder>,
) => {
  const order = await requireProductionOrder(organizationId, productionOrderId);
  if (!['draft', 'planned'].includes(order.status)) throw new Error('Solo se pueden editar órdenes pendientes.');
  const { id: _id, organizationId: _organizationId, status: _status, createdBy: _createdBy, ...safeInput } = input;
  if (safeInput.output) assertLine(safeInput.output, 'producto de salida');
  if (safeInput.components) assertLines(safeInput.components, 'componente');
  Object.assign(order, safeInput, { updatedBy: userId });
  return order.save();
};

export const deleteProductionOrder = async (organizationId: OrganizationId, productionOrderId: ProductionOrderId) => {
  const order = await requireProductionOrder(organizationId, productionOrderId);
  if (!['draft', 'planned'].includes(order.status)) throw new Error('Solo se pueden eliminar órdenes pendientes.');
  await order.deleteOne();
  return { id: productionOrderId, deleted: true };
};

export const startProductionOrder = async (organizationId: OrganizationId, userId: UserId, productionOrderId: ProductionOrderId) => {
  const order = await requireProductionOrder(organizationId, productionOrderId);
  if (!['draft', 'planned'].includes(order.status)) throw new Error('La orden de producción no se puede iniciar.');
  await applyChanges(
    order.components.map((line) => ({ warehouseId: order.warehouseId, line, field: 'quantity' as const, delta: -line.quantity })),
    organizationId,
    userId,
  );
  order.status = 'in_progress';
  order.startedAt = new Date();
  order.updatedBy = userId;
  return order.save();
};

export const completeProductionOrder = async (organizationId: OrganizationId, userId: UserId, productionOrderId: ProductionOrderId) => {
  const order = await requireProductionOrder(organizationId, productionOrderId);
  if (order.status !== 'in_progress') throw new Error('Solo se pueden completar órdenes en curso.');
  await changeStock(organizationId, userId, order.warehouseId, order.output, 'quantity', order.output.quantity);
  order.status = 'completed';
  order.completedAt = new Date();
  order.updatedBy = userId;
  return order.save();
};

export const cancelProductionOrder = async (organizationId: OrganizationId, userId: UserId, productionOrderId: ProductionOrderId) => {
  const order = await requireProductionOrder(organizationId, productionOrderId);
  if (order.status === 'completed' || order.status === 'cancelled') throw new Error('La orden de producción ya no se puede cancelar.');
  if (order.status === 'in_progress') {
    await applyChanges(
      order.components.map((line) => ({ warehouseId: order.warehouseId, line, field: 'quantity' as const, delta: line.quantity })),
      organizationId,
      userId,
    );
  }
  order.status = 'cancelled';
  order.updatedBy = userId;
  return order.save();
};
