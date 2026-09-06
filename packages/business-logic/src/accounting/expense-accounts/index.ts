import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ExpenseAccountSchemaMongo,
  LifecycleStatus,
  type ExpenseAccount,
  type ExpenseAccountId,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

const accounts = () =>
  getModel<ExpenseAccount>(Collection.EXPENSE_ACCOUNTS, ExpenseAccountSchemaMongo);
const scope = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
});

type AccountQuery = {
  organizationId: OrganizationId;
  search?: string;
  active?: boolean | string;
  type?: string;
};

export const listExpenseAccounts = async ({ organizationId, search, active, type }: AccountQuery) => {
  const query: Record<string, unknown> = { ...scope(organizationId) };
  if (search?.trim()) {
    const value = { $regex: search.trim(), $options: 'i' };
    query.$or = [{ code: value }, { name: value }, { description: value }];
  }
  if (active !== undefined) query.active = active === true || active === 'true';
  if (type) query.type = type;
  return accounts().find(query).sort({ code: 1, name: 1 });
};

export const getExpenseAccount = async (
  expenseAccountId: ExpenseAccountId,
  organizationId: OrganizationId,
) => {
  const account = await accounts().findOne({ _id: expenseAccountId, ...scope(organizationId) });
  if (!account) throw new Error('La cuenta contable no existe.');
  return account;
};

const validate = async (
  data: Partial<ExpenseAccount>,
  organizationId: OrganizationId,
  ownId?: ExpenseAccountId,
) => {
  if (data.parentId) {
    if (ownId && String(data.parentId) === String(ownId))
      throw new Error('Una cuenta no puede ser su propia cuenta padre.');
    await getExpenseAccount(data.parentId, organizationId);
  }
};

export const createExpenseAccount = async (data: Partial<ExpenseAccount>) => {
  const code = data.code?.trim();
  const name = data.name?.trim();
  if (!data.organizationId || !code || !name)
    throw new Error('Organización, código y nombre son obligatorios.');
  await validate(data, data.organizationId);
  if (data.isDefault) {
    await accounts().updateMany(scope(data.organizationId), { $set: { isDefault: false } });
  }
  return accounts().create({ ...data, code, name });
};

export const updateExpenseAccount = async (
  expenseAccountId: ExpenseAccountId,
  organizationId: OrganizationId,
  data: Partial<ExpenseAccount>,
) => {
  const current = await getExpenseAccount(expenseAccountId, organizationId);
  const code = data.code === undefined ? current.code : data.code.trim();
  const name = data.name === undefined ? current.name : data.name.trim();
  if (!code || !name) throw new Error('Código y nombre son obligatorios.');
  await validate(data, organizationId, expenseAccountId);
  if (data.isDefault) {
    await accounts().updateMany(
      { ...scope(organizationId), _id: { $ne: expenseAccountId } },
      { $set: { isDefault: false } },
    );
  }
  const account = await accounts().findOneAndUpdate(
    { _id: expenseAccountId, ...scope(organizationId) },
    { $set: { ...data, code, name } },
    { new: true, runValidators: true },
  );
  if (!account) throw new Error('La cuenta contable no existe.');
  return account;
};

export const deleteExpenseAccount = async (
  expenseAccountId: ExpenseAccountId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const account = await getExpenseAccount(expenseAccountId, organizationId);
  if (account.isDefault) throw new Error('No puedes eliminar la cuenta contable predeterminada.');
  if (await accounts().exists({ ...scope(organizationId), parentId: expenseAccountId }))
    throw new Error('No puedes eliminar una cuenta que tiene subcuentas.');
  account.lifecycleStatus = LifecycleStatus.DELETED;
  account.active = false;
  account.deletedAt = new Date();
  account.deletedBy = userId;
  account.updatedBy = userId;
  await account.save();
  return account;
};
