import { BrandSchemaMongo, type InventoryBrand } from '@hlb/contracts';
import { Collection, getModel } from '@hlb/constant-definitions';

export const createBrand = async (data: Partial<InventoryBrand>): Promise<InventoryBrand> => {
  const model = getModel<InventoryBrand>(Collection.BRANDS, BrandSchemaMongo);
  const brand = new model(data);
  const createdBrand = await brand.save();

  return createdBrand;
};
