import { Collection, getModel } from "@hlb/constant-definitions";
import { Warehouse, WarehouseId, WarehouseSchemaMongo } from "@hlb/contracts";

export const updateWarehouse = async (warehouseId:WarehouseId, data: Partial<Warehouse>) => {
    const model = getModel(Collection.WAREHOUSES, WarehouseSchemaMongo);

    const dataToUpdate = {
        ...data,
        updatedAt: new Date().toISOString(),
    }

    const result = await model.updateOne({_id: warehouseId}, {$set: dataToUpdate});
    if(!result.acknowledged && result.matchedCount < 1) throw new Error('Could not update warehouse');

    const warehouse = await model.findById(warehouseId)
    return warehouse;
}