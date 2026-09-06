import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, type Warehouse, WarehouseSchemaMongo } from '@hlb/contracts';

export const createWarehouse = async (data: Partial<Warehouse>): Promise<Warehouse> => {
  const model = getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo);
  const warehousesCount = data.organizationId
    ? await model.countDocuments({ organizationId: data.organizationId, lifecycleStatus: LifecycleStatus.ACTIVE })
    : 0;
  const isDefault = Boolean(data.isDefault || warehousesCount === 0);

  if (isDefault && data.organizationId) {
    await model.updateMany({ organizationId: data.organizationId }, { $set: { isDefault: false } });
  }

  const warehouse = new model({
    ...data,
    isDefault,
    lifecycleStatus: data.lifecycleStatus ?? LifecycleStatus.ACTIVE,
  });
  const createdWarehouse = await warehouse.save();

  return createdWarehouse;
};
