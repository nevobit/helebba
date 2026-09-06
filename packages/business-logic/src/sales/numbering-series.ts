import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  NumberingSeriesSchemaMongo,
  type NumberingSeries,
  type NumberingSeriesId,
  type OffsetPaginatedResult,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

type ListNumberingSeriesParams = {
  organizationId: OrganizationId;
  page?: number | string;
  limit?: number | string;
  search?: string;
  documentType?: string;
  active?: boolean | string;
};

const model = () =>
  getModel<NumberingSeries>(Collection.NUMBERING_SERIES, NumberingSeriesSchemaMongo);
const activeScope = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
});
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listNumberingSeries = async ({
  organizationId,
  page = 1,
  limit = 100,
  search = '',
  documentType,
  active,
}: ListNumberingSeriesParams): Promise<OffsetPaginatedResult<NumberingSeries>> => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(250, Math.max(1, Number(limit) || 100));
  const normalizedSearch = search.trim();
  const filter = {
    ...activeScope(organizationId),
    ...(normalizedSearch ? { name: { $regex: normalizedSearch, $options: 'i' } } : {}),
    ...(documentType ? { documentTypes: documentType } : {}),
    ...(active === undefined ? {} : { active: active === true || active === 'true' }),
  };
  const [items, total] = await Promise.all([
    model().find(filter).sort({ isDefault: -1, name: 1 }).skip((safePage - 1) * safeLimit).limit(safeLimit),
    model().countDocuments(filter),
  ]);
  const pages = Math.ceil(total / safeLimit);
  return {
    kind: 'offset',
    count: total,
    items,
    pageInfo: {
      page: safePage,
      pageSize: safeLimit,
      totalItems: total,
      pages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < pages,
      previousPage: safePage > 1 ? safePage - 1 : null,
      nextPage: safePage < pages ? safePage + 1 : null,
    },
  };
};

export const getNumberingSeries = async (
  seriesId: NumberingSeriesId,
  organizationId: OrganizationId,
): Promise<NumberingSeries> => {
  const series = await model().findOne({ _id: seriesId, ...activeScope(organizationId) });
  if (!series) throw new Error('La serie de numeración no existe.');
  return series;
};

export const createNumberingSeries = async (
  data: Partial<NumberingSeries>,
): Promise<NumberingSeries> => {
  const name = data.name?.trim();
  if (!name) throw new Error('El nombre de la serie es obligatorio.');
  if (!data.organizationId) throw new Error('La organización es obligatoria.');
  if (
    await model().exists({
      ...activeScope(data.organizationId),
      name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
    })
  ) {
    throw new Error('Ya existe una serie de numeración con ese nombre.');
  }

  if (data.isDefault) {
    await model().updateMany(activeScope(data.organizationId), { $set: { isDefault: false } });
  }
  return new (model())({ ...data, name }).save();
};

export const updateNumberingSeries = async (
  seriesId: NumberingSeriesId,
  organizationId: OrganizationId,
  data: Partial<NumberingSeries>,
): Promise<NumberingSeries> => {
  const series = await model().findOne({ _id: seriesId, ...activeScope(organizationId) });
  if (!series) throw new Error('La serie de numeración no existe.');

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw new Error('El nombre de la serie es obligatorio.');
    if (
      await model().exists({
        ...activeScope(organizationId),
        _id: { $ne: seriesId },
        name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
      })
    ) {
      throw new Error('Ya existe una serie de numeración con ese nombre.');
    }
    series.name = name;
  }

  const editable = [
    'prefix',
    'suffix',
    'separator',
    'padding',
    'nextNumber',
    'documentTypes',
    'resetPeriod',
    'lastResetKey',
    'active',
    'updatedBy',
  ] as const;
  for (const key of editable) {
    if (data[key] !== undefined) (series as any)[key] = data[key];
  }
  if (data.isDefault === true) {
    await model().updateMany(
      { ...activeScope(organizationId), _id: { $ne: seriesId } },
      { $set: { isDefault: false } },
    );
    series.isDefault = true;
  } else if (data.isDefault === false && !series.isDefault) {
    series.isDefault = false;
  }

  await series.save();
  return series;
};

export const deleteNumberingSeries = async (
  seriesId: NumberingSeriesId,
  organizationId: OrganizationId,
  deletedBy: UserId,
): Promise<NumberingSeries> => {
  const series = await model().findOne({ _id: seriesId, ...activeScope(organizationId) });
  if (!series) throw new Error('La serie de numeración no existe o ya fue eliminada.');
  if (series.isDefault) throw new Error('No puedes eliminar la serie de numeración predeterminada.');

  series.lifecycleStatus = LifecycleStatus.DELETED;
  series.deletedAt = new Date();
  series.deletedBy = deletedBy;
  series.updatedBy = deletedBy;
  await series.save();
  return series;
};
