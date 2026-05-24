import { Collection, getModel } from "@hlb/constant-definitions";
import { Warehouse, WarehouseId, WarehouseSchemaMongo } from "@hlb/contracts";

export const deleteWarehouse = async (warehouseId:WarehouseId) => {
    const model = getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo);
    const result = await model.deleteOne(warehouseId)
    if(!result.acknowledged) throw new Error('could not delete warehouse');
    return result.deletedCount > 0;
}