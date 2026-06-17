import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BankingAccountSchemaMongo,
  LifecycleStatus,
  type BankingAccount,
} from '@hlb/contracts';

export const createTreasuryAccount = async (
  data: Partial<BankingAccount>,
): Promise<BankingAccount> => {
  const model = getModel<BankingAccount>(Collection.BANKING_ACCOUNTS, BankingAccountSchemaMongo);
  const kind = data.kind ?? 'bank';
  const initialBalance = Number(data.initialBalance ?? data.balance ?? 0);
  const account = new model({
    ...data,
    kind,
    productType: data.productType ?? (kind === 'cash' ? 'cash' : 'checking'),
    currency: data.currency ?? 'COP',
    initialBalance,
    balance: Number(data.balance ?? initialBalance),
    connectionStatus: data.connectionStatus ?? 'not_connected',
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  });

  return account.save();
};
