import { Collection, getModel } from "@hlb/constant-definitions";
import { LifecycleStatus, Warehouse, WarehouseId, WarehouseSchemaMongo } from "@hlb/contracts";

export const softDeleteWarehouse = async (warehouseId: WarehouseId) => {
    const model = getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo);
    const result = await model.updateOne(
        {_id: warehouseId},
        {$set: {lifecycleStatus: LifecycleStatus.DELETED}},
    )

    if(!result.acknowledged && result.matchedCount < 1) throw new Error('Could not update warehouse');

    const warehouse = await model.findById(warehouseId)
    return warehouse;
}