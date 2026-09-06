import { Collection, getModel } from '@hlb/constant-definitions';
import {
  PriceListSchemaMongo,
  type OffsetPaginatedResult,
  type Params,
  type PriceList,
} from '@hlb/contracts';

export const getAllPriceLists = async (
  params: Params,
): Promise<OffsetPaginatedResult<PriceList>> => {
  const { page = 1, limit = 100, search = '', organizationId } = params;
  const model = getModel<PriceList>(Collection.PRICE_LISTS, PriceListSchemaMongo);
  const skip = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const filter = {
    organizationId,
    ...(normalizedSearch
      ? {
          $or: [
            { name: { $regex: normalizedSearch, $options: 'i' } },
            { description: { $regex: normalizedSearch, $options: 'i' } },
          ],
        }
      : {}),
  };

  const priceLists = await model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await model.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  return {
    kind: 'offset',
    count: total,
    items: priceLists,
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