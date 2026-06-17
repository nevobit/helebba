import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BankingAccountSchemaMongo,
  LifecycleStatus,
  type BankingAccount,
  type BankingAccountId,
  type OrganizationId,
} from '@hlb/contracts';

export const getTreasuryAccountById = async (
  accountId: BankingAccountId | string,
  organizationId?: OrganizationId,
) => {
  const model = getModel<BankingAccount>(Collection.BANKING_ACCOUNTS, BankingAccountSchemaMongo);

  return model.findOne({
    _id: accountId,
    lifecycleStatus: { $in: [LifecycleStatus.ACTIVE, LifecycleStatus.ARCHIVED] },
    ...(organizationId ? { organizationId } : {}),
  });
};
