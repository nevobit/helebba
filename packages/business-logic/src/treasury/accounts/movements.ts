import { Collection, getModel } from '@hlb/constant-definitions';
import {
  BankingAccountSchemaMongo,
  LifecycleStatus,
  TreasuryMovementSchemaMongo,
  type BankingAccount,
  type BankingAccountId,
  type OffsetPaginatedResult,
  type OrganizationId,
  type Params,
  type TreasuryAccountKind,
  type TreasuryMovement,
  type TreasuryMovementId,
  type UserId,
} from '@hlb/contracts';
import { toOffsetResult } from './utils';

type MovementListParams = Params<{
  accountId: BankingAccountId | string;
  accountKind?: TreasuryAccountKind;
  reconciliationStatus?: string;
}>;

const getSignedAmount = (movement: Partial<TreasuryMovement>) => {
  const amount = Math.abs(Number(movement.amount ?? 0));
  return movement.direction === 'outflow' ? -amount : amount;
};

export const getTreasuryMovements = async (
  params: MovementListParams,
): Promise<OffsetPaginatedResult<TreasuryMovement>> => {
  const { page = 1, limit = 100, search = '', organizationId, accountId, accountKind } = params;
  const model = getModel<TreasuryMovement>(
    Collection.TREASURY_MOVEMENTS,
    TreasuryMovementSchemaMongo,
  );
  const skip = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const filter = {
    organizationId,
    bankingAccountId: accountId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    ...(accountKind ? { accountKind } : {}),
    ...(params.reconciliationStatus && params.reconciliationStatus !== 'all'
      ? { reconciliationStatus: params.reconciliationStatus }
      : {}),
    ...(normalizedSearch
      ? {
          $or: [
            { description: { $regex: normalizedSearch, $options: 'i' } },
            { reference: { $regex: normalizedSearch, $options: 'i' } },
          ],
        }
      : {}),
  };

  const movements = await model.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit);
  const total = await model.countDocuments(filter);

  return toOffsetResult(movements, page, limit, total);
};

export const createTreasuryMovement = async (
  data: Partial<TreasuryMovement>,
): Promise<TreasuryMovement> => {
  const movementModel = getModel<TreasuryMovement>(
    Collection.TREASURY_MOVEMENTS,
    TreasuryMovementSchemaMongo,
  );
  const accountModel = getModel<BankingAccount>(Collection.BANKING_ACCOUNTS, BankingAccountSchemaMongo);
  const account = await accountModel.findOne({
    _id: data.bankingAccountId,
    organizationId: data.organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!account) throw new Error('Treasury account not found');

  const signedAmount = getSignedAmount(data);
  const nextBalance = Number(account.balance ?? 0) + signedAmount;
  const movement = new movementModel({
    ...data,
    accountKind: data.accountKind ?? account.kind,
    currency: data.currency ?? account.currency,
    amount: Math.abs(Number(data.amount ?? 0)),
    direction: data.direction ?? 'inflow',
    balance: data.balance ?? nextBalance,
    reconciliationStatus: data.reconciliationStatus ?? 'pending',
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  });
  const createdMovement = await movement.save();

  await accountModel.updateOne(
    { _id: account.id ?? account._id },
    { $set: { balance: nextBalance, updatedAt: new Date(), updatedBy: data.updatedBy } },
  );

  return createdMovement;
};

export const reconcileTreasuryMovement = async ({
  bankingAccountId,
  movementId,
  organizationId,
  userId,
  data,
}: {
  bankingAccountId: BankingAccountId | string;
  movementId: TreasuryMovementId | string;
  organizationId: OrganizationId;
  userId: UserId;
  data?: Partial<TreasuryMovement>;
}) => {
  const movementModel = getModel<TreasuryMovement>(
    Collection.TREASURY_MOVEMENTS,
    TreasuryMovementSchemaMongo,
  );

  return movementModel.findOneAndUpdate(
    {
      _id: movementId,
      bankingAccountId,
      organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
    {
      $set: {
        ...data,
        reconciliationStatus: 'reconciled',
        reconciledAt: new Date(),
        reconciledBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    },
    { new: true },
  );
};
