import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  TaxSchemaMongo,
  type OffsetPaginatedResult,
  type OrganizationId,
  type Params,
  type Tax,
  type TaxId,
  type UserId,
} from '@hlb/contracts';
import { getExpenseAccount } from '../expense-accounts';

const model = () => getModel<Tax>(Collection.TAXES, TaxSchemaMongo);
const scope = (organizationId: OrganizationId) => ({ organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } });

export const listTaxes = async (params: Params<{ active?: boolean; kind?: string }>): Promise<OffsetPaginatedResult<Tax>> => {
  const { page = 1, limit = 100, search = '', organizationId, active, kind } = params;
  if (!organizationId) throw new Error('La organización es obligatoria.');
  const filter = { ...scope(organizationId), ...(active === undefined ? {} : { active }), ...(kind ? { kind } : {}), ...(search.trim() ? { $or: ['code', 'name', 'description'].map((field) => ({ [field]: { $regex: search.trim(), $options: 'i' } })) } : {}) };
  const [items, total] = await Promise.all([model().find(filter).sort({ code: 1 }).skip((page - 1) * limit).limit(limit), model().countDocuments(filter)]);
  const pages = Math.ceil(total / limit);
  return { kind: 'offset', count: total, items, pageInfo: { page, pages, pageSize: limit, totalItems: total, hasPreviousPage: page > 1, hasNextPage: page < pages, previousPage: page > 1 ? page - 1 : null, nextPage: page < pages ? page + 1 : null } };
};

export const getTax = async (id: TaxId, organizationId: OrganizationId) => {
  const tax = await model().findOne({ _id: id, ...scope(organizationId) });
  if (!tax) throw new Error('El impuesto no existe.');
  return tax;
};

const validate = async (data: Partial<Tax>, organizationId: OrganizationId) => {
  if (data.rate !== undefined && (!Number.isFinite(data.rate) || data.rate < 0)) throw new Error('La tasa del impuesto no es válida.');
  if (data.accountId) await getExpenseAccount(data.accountId as any, organizationId);
};

export const createTax = async (data: Partial<Tax>) => {
  if (!data.organizationId || !data.code?.trim() || !data.name?.trim() || data.rate === undefined) throw new Error('Organización, código, nombre y tasa son obligatorios.');
  await validate(data, data.organizationId);
  if (data.isDefault) await model().updateMany(scope(data.organizationId), { $set: { isDefault: false } });
  return new (model())({ ...data, code: data.code.trim(), name: data.name.trim() }).save();
};

export const updateTax = async (id: TaxId, organizationId: OrganizationId, data: Partial<Tax>) => {
  await validate(data, organizationId);
  if (data.isDefault) await model().updateMany({ ...scope(organizationId), _id: { $ne: id } }, { $set: { isDefault: false } });
  const tax = await model().findOneAndUpdate({ _id: id, ...scope(organizationId) }, { $set: data }, { new: true, runValidators: true });
  if (!tax) throw new Error('El impuesto no existe.');
  return tax;
};

export const deleteTax = async (id: TaxId, organizationId: OrganizationId, userId: UserId) => {
  const tax = await model().findOneAndUpdate({ _id: id, ...scope(organizationId) }, { $set: { lifecycleStatus: LifecycleStatus.DELETED, active: false, deletedAt: new Date(), deletedBy: userId, updatedBy: userId } }, { new: true });
  if (!tax) throw new Error('El impuesto no existe o ya fue eliminado.');
  return tax;
};
