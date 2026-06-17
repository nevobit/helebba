import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BankingAccountSchemaMongo,
  LifecycleStatus,
  type BankingAccount,
  type BankingAccountId,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

export const archiveTreasuryAccount = async ({
  accountId,
  organizationId,
  userId,
}: {
  accountId: BankingAccountId | string;
  organizationId: OrganizationId;
  userId: UserId;
}) => {
  const model = getModel<BankingAccount>(Collection.BANKING_ACCOUNTS, BankingAccountSchemaMongo);

  return model.findOneAndUpdate(
    {
      _id: accountId,
      organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.ARCHIVED,
        archivedAt: new Date(),
        archivedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    },
    { new: true },
  );
};
