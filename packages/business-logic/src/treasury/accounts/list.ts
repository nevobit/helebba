import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BankingAccountSchemaMongo,
  LifecycleStatus,
  type BankingAccount,
  type OffsetPaginatedResult,
  type Params,
  type TreasuryAccountKind,
} from '@hlb/contracts';
import { toOffsetResult } from './utils';

type AccountListParams = Params<{
  kind?: TreasuryAccountKind | 'all';
  includeArchived?: boolean;
}>;

export const getAllTreasuryAccounts = async (
  params: AccountListParams,
): Promise<OffsetPaginatedResult<BankingAccount>> => {
  const { page = 1, limit = 100, search = '', organizationId, kind = 'all' } = params;
  const model = getModel<BankingAccount>(Collection.BANKING_ACCOUNTS, BankingAccountSchemaMongo);
  const skip = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const lifecycleStatuses = params.includeArchived
    ? [LifecycleStatus.ACTIVE, LifecycleStatus.ARCHIVED]
    : [LifecycleStatus.ACTIVE];
  const filter = {
    organizationId,
    lifecycleStatus: { $in: lifecycleStatuses },
    ...(kind !== 'all' ? { kind } : {}),
    ...(normalizedSearch
      ? {
          $or: [
            { name: { $regex: normalizedSearch, $options: 'i' } },
            { bankName: { $regex: normalizedSearch, $options: 'i' } },
            { accountNumber: { $regex: normalizedSearch, $options: 'i' } },
            { iban: { $regex: normalizedSearch, $options: 'i' } },
          ],
        }
      : {}),
  };

  const accounts = await model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await model.countDocuments(filter);

  return toOffsetResult(accounts, page, limit, total);
};
