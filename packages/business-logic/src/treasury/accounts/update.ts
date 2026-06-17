import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BankingAccountSchemaMongo,
  LifecycleStatus,
  type BankingAccount,
  type BankingAccountId,
} from '@hlb/contracts';

export const updateTreasuryAccount = async (
  accountId: BankingAccountId | string,
  data: Partial<BankingAccount>,
) => {
  const model = getModel<BankingAccount>(Collection.BANKING_ACCOUNTS, BankingAccountSchemaMongo);

  return model.findOneAndUpdate(
    {
      _id: accountId,
      organizationId: data.organizationId,
      lifecycleStatus: { $in: [LifecycleStatus.ACTIVE, LifecycleStatus.ARCHIVED] },
    },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
    { new: true },
  );
};
