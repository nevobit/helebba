import { Collection, getModel } from '@hlb/constant-definitions';
import { type Warehouse, type WarehouseId, WarehouseSchemaMongo  } from '@hlb/contracts';

export const getWarehouseById = async (warehouseId: WarehouseId) => {
  const model = getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo);
  const warehouse = await model.findById(warehouseId);
  return warehouse;
};
