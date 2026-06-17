import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BrandSchemaMongo,
  type InventoryBrand,
  type OffsetPaginatedResult,
  type Params,
} from '@hlb/contracts';

export const getAllBrands = async (params: Params): Promise<OffsetPaginatedResult<InventoryBrand>> => {
  const { page = 1, limit = 100, search = '', organizationId } = params;
  const model = getModel<InventoryBrand>(Collection.BRANDS, BrandSchemaMongo);
  const skip = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const filter = {
    organizationId,
    ...(normalizedSearch
      ? {
          $or: [
            { name: { $regex: normalizedSearch, $options: 'i' } },
            { description: { $regex: normalizedSearch, $options: 'i' } },
            { website: { $regex: normalizedSearch, $options: 'i' } },
          ],
        }
      : {}),
  };

  const brands = await model.find(filter).sort({ position: 1, createdAt: -1 }).skip(skip).limit(limit);
  const total = await model.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  return {
    kind: 'offset',
    count: total,
    items: brands,
    pageInfo: {
      page,
      pages,
      pageSize: limit,
      totalItems: total,
      hasPreviousPage: page > 1,
      hasNextPage: page < pages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < pages ? page + 1 : null,
    },
  };
};
