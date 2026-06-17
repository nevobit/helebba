import { Collection, getModel } from "@hlb/constant-definitions";
import { LifecycleStatus, type Warehouse, type WarehouseId, WarehouseSchemaMongo } from "@hlb/contracts";

export const softDeleteWarehouse = async (warehouseId: WarehouseId) => {
    const model = getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo);
    const currentWarehouse = await model.findById(warehouseId);

    if (!currentWarehouse) throw new Error('Warehouse not found');
    if (currentWarehouse.isDefault) throw new Error('Default warehouse cannot be deleted');

    const warehousesCount = await model.countDocuments({
        organizationId: currentWarehouse.organizationId,
        lifecycleStatus: LifecycleStatus.ACTIVE,
    });

    if (warehousesCount <= 1) throw new Error('At least one warehouse is required');

    const result = await model.updateOne(
        {_id: warehouseId},
        {$set: {lifecycleStatus: LifecycleStatus.DELETED}},
    )

    if(!result.acknowledged && result.matchedCount < 1) throw new Error('Could not update warehouse');

    const warehouse = await model.findById(warehouseId)
    return warehouse;
}
