import { Collection, getModel } from "@hlb/constant-definitions";
import { Warehouse, WarehouseSchemaMongo } from "@hlb/contracts";

export const createWarehouse = async (data: Warehouse): Promise<Warehouse> => {

    const model = getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo);

    const warehouse = new model(data);

    const createdWarehouse = await warehouse.save();

    return createdWarehouse;
}