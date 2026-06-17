import { Collection, getModel } from "@hlb/constant-definitions";
import { LifecycleStatus, type Warehouse, type WarehouseId, WarehouseSchemaMongo } from "@hlb/contracts";

export const deleteWarehouse = async (warehouseId:WarehouseId) => {
    const model = getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo);
    const warehouse = await model.findById(warehouseId);

    if (!warehouse) throw new Error('Warehouse not found');
    if (warehouse.isDefault) throw new Error('Default warehouse cannot be deleted');

    const warehousesCount = await model.countDocuments({
        organizationId: warehouse.organizationId,
        lifecycleStatus: LifecycleStatus.ACTIVE,
    });

    if (warehousesCount <= 1) throw new Error('At least one warehouse is required');

    const result = await model.deleteOne({ _id: warehouseId })
    if(!result.acknowledged) throw new Error('could not delete warehouse');
    return result.deletedCount > 0;
}
