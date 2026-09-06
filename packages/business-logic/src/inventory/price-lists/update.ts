import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PriceListSchemaMongo,
  type OrganizationId,
  type PriceList,
  type PriceListId,
  type UserId,
} from '@hlb/contracts';

export const updatePriceList = async ({
  priceListId,
  organizationId,
  name,
  currency,
  description,
  updatedBy,
}: {
  priceListId: PriceListId;
  organizationId: OrganizationId;
  name?: string;
  currency?: string;
  description?: string;
  updatedBy: UserId;
}): Promise<PriceList> => {
  const model = getModel<PriceList>(Collection.PRICE_LISTS, PriceListSchemaMongo);
  const existing = await model.findOne({
    _id: priceListId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!existing) throw new Error('La tarifa no existe o no pertenece a la organización.');
  if (name !== undefined && !String(name).trim()) {
    throw new Error('El nombre de la tarifa no puede estar vacío.');
  }

  existing.name = name !== undefined ? String(name).trim() : existing.name;
  existing.currency = currency !== undefined ? String(currency).trim() || 'COP' : existing.currency;
  existing.description = description !== undefined ? String(description).trim() : existing.description;
  existing.updatedBy = updatedBy;

  return existing.save();
};