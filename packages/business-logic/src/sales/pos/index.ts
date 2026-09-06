import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PosStoreSchemaMongo,
  WarehouseSchemaMongo,
  type OffsetPaginatedResult,
  type OrganizationId,
  type Params,
  type PosCashRegister,
  type PosRegisterId,
  type PosStore,
  type PosStoreId,
  type UserId,
  type Warehouse,
} from '@hlb/contracts';

export * from './transactions';

const storeModel = () => getModel<PosStore>(Collection.POS_STORES, PosStoreSchemaMongo);

export const listPosStores = async (params: Params): Promise<OffsetPaginatedResult<PosStore>> => {
  const { organizationId, page = 1, limit = 100, search = '' } = params;
  const filter = {
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    ...(search.trim() ? { name: { $regex: search.trim(), $options: 'i' } } : {}),
  };
  const skip = (page - 1) * limit;
  const [items, count] = await Promise.all([
    storeModel().find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    storeModel().countDocuments(filter),
  ]);
  const pages = Math.ceil(count / limit);
  return {
    kind: 'offset',
    count,
    items,
    pageInfo: {
      page,
      pages,
      pageSize: limit,
      totalItems: count,
      hasPreviousPage: page > 1,
      hasNextPage: page < pages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < pages ? page + 1 : null,
    },
  };
};

export const createPosStore = async (data: Partial<PosStore>) => {
  const name = data.name?.trim();
  const address = data.address?.trim();
  if (!name) throw new Error('Ingresa el nombre de la tienda.');
  if (!address) throw new Error('Ingresa la dirección de la tienda.');
  if (!data.warehouseId) throw new Error('Selecciona una bodega para la tienda.');
  const warehouse = await getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo).findOne({
    _id: data.warehouseId,
    organizationId: data.organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!warehouse) throw new Error('La bodega no existe o no pertenece a la organización.');
  const mainRegister: PosCashRegister = {
    id: randomUUID() as PosRegisterId,
    name: 'Registradora principal',
    description: 'Esta es la registradora principal',
    isMain: true,
    status: 'closed',
    paymentMethodIds: [],
  };
  return new (storeModel())({
    ...data,
    name,
    address,
    warehouseName: warehouse.name,
    active: true,
    registers: [mainRegister],
    sessions: [],
  }).save();
};

export const getPosStore = async (storeId: PosStoreId, organizationId: OrganizationId) =>
  storeModel().findOne({
    _id: storeId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });

export const addPosRegister = async (
  storeId: PosStoreId,
  organizationId: OrganizationId,
  data: Partial<PosCashRegister>,
) => {
  const name = data.name?.trim();
  if (!name) throw new Error('Ingresa el nombre de la caja registradora.');
  if ((data.description?.length ?? 0) > 50)
    throw new Error('La descripción no puede superar 50 caracteres.');
  const register: PosCashRegister = {
    id: randomUUID() as PosRegisterId,
    name,
    description: data.description?.trim() ?? '',
    isMain: false,
    status: 'closed',
    paymentMethodIds: data.paymentMethodIds ?? [],
  };
  const store = await storeModel().findOneAndUpdate(
    { _id: storeId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    { $push: { registers: register } },
    { new: true, runValidators: true },
  );
  if (!store) throw new Error('Tienda no encontrada.');
  return store;
};

export const deletePosStore = async (
  storeId: PosStoreId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const hasOpenRegister = await storeModel().exists({
    _id: storeId,
    organizationId,
    'registers.status': 'open',
  });
  if (hasOpenRegister) throw new Error('Cierra todas las cajas antes de eliminar la tienda.');
  const result = await storeModel().updateOne(
    { _id: storeId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
      },
    },
  );
  if (!result.matchedCount) throw new Error('Tienda no encontrada.');
  return true;
};
