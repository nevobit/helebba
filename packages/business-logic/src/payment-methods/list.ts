import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PaymentMethodSchemaMongo,
  type OffsetPaginatedResult,
  type Params,
  type PaymentMethod,
  type UserId,
} from '@hlb/contracts';
import { seedDefaultPaymentMethods } from './defaults';

type PaymentMethodListParams = Params<{
  userId?: UserId;
}>;

export const getAllPaymentMethods = async (
  params: PaymentMethodListParams,
): Promise<OffsetPaginatedResult<PaymentMethod>> => {
  const { page = 1, limit = 100, search = '', organizationId } = params;
  const model = getModel<PaymentMethod>(Collection.PAYMENT_METHODS, PaymentMethodSchemaMongo);

  if (params.organizationId && params.userId) {
    await seedDefaultPaymentMethods({
      organizationId: params.organizationId,
      userId: params.userId,
    });
  }

  const skip = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const filter = {
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    ...(normalizedSearch
      ? {
          $or: [
            { name: { $regex: normalizedSearch, $options: 'i' } },
            { type: { $regex: normalizedSearch, $options: 'i' } },
          ],
        }
      : {}),
  };

  const paymentMethods = await model.find(filter).sort({ isDefault: -1, createdAt: 1 }).skip(skip).limit(limit);
  const total = await model.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  return {
    kind: 'offset',
    count: total,
    items: paymentMethods,
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
