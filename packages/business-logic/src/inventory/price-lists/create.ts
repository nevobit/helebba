import { Collection, getModel } from '@hlb/constant-definitions';
import {
  PriceListSchemaMongo,
  type OrganizationId,
  type PriceList,
  type UserId,
} from '@hlb/contracts';

export const createPriceList = async ({
  organizationId,
  name,
  currency,
  description,
  createdBy,
  updatedBy,
}: {
  organizationId: OrganizationId;
  name: string;
  currency: string;
  description: string;
  createdBy: UserId;
  updatedBy: UserId;
}): Promise<PriceList> => {
  if (!name.trim()) throw new Error('El nombre de la tarifa no puede estar vacío.');

  const model = getModel<PriceList>(Collection.PRICE_LISTS, PriceListSchemaMongo);
  const priceList = new model({
    organizationId,
    name: name.trim(),
    currency: currency.trim() || 'COP',
    description: description.trim(),
    createdBy,
    updatedBy,
  });
  return priceList.save();
};