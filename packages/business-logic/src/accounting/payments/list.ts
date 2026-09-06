import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PaymentSchemaMongo,
  type OffsetPaginatedResult,
  type Params,
  type Payment,
} from '@hlb/contracts';

type PaymentListParams = Params<{
  status?: string;
}>;

export const getAllPayments = async (
  params: PaymentListParams,
): Promise<OffsetPaginatedResult<Payment>> => {
  const { page = 1, limit = 100, search = '', organizationId, status } = params;
  const model = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const skip = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const filter = {
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    ...(status && status !== 'all' ? { status } : {}),
    ...(normalizedSearch
      ? {
          $or: [
            { contactName: { $regex: normalizedSearch, $options: 'i' } },
            { description: { $regex: normalizedSearch, $options: 'i' } },
          ],
        }
      : {}),
  };

  const payments = await model.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit);
  const total = await model.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  return {
    kind: 'offset',
    count: total,
    items: payments,
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
