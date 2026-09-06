import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  RecurringDocumentSchemaMongo,
  type Document as SalesDocument,
  type OffsetPaginatedResult,
  type OrganizationId,
  type RecurringDocument,
  type RecurringDocumentId,
  type RecurringFrequency,
  type UserId,
} from '@hlb/contracts';
import { createDocument } from './documents/create';

type ListRecurringDocumentsParams = {
  organizationId: OrganizationId;
  page?: number | string;
  limit?: number | string;
  search?: string;
  documentType?: string;
  active?: boolean | string;
};

type GenerateDueParams = {
  organizationId: OrganizationId;
  userId: UserId;
  limit?: number;
};

const model = () =>
  getModel<RecurringDocument>(Collection.RECURRING_DOCUMENTS, RecurringDocumentSchemaMongo);

const activeScope = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
});

const advanceDate = (value: string, frequency: RecurringFrequency, interval: number) => {
  const date = new Date(value);
  const amount = Math.max(1, Number(interval) || 1);
  if (Number.isNaN(date.getTime())) throw new Error('La fecha de próxima ejecución no es válida.');

  if (frequency === 'daily') date.setUTCDate(date.getUTCDate() + amount);
  if (frequency === 'weekly') date.setUTCDate(date.getUTCDate() + amount * 7);
  if (frequency === 'monthly') date.setUTCMonth(date.getUTCMonth() + amount);
  if (frequency === 'yearly') date.setUTCFullYear(date.getUTCFullYear() + amount);
  return date.toISOString();
};

const validateSchedule = (data: Partial<RecurringDocument>) => {
  if (data.interval !== undefined && (!Number.isInteger(data.interval) || data.interval < 1)) {
    throw new Error('El intervalo debe ser un número entero mayor que cero.');
  }
  for (const field of ['startAt', 'nextRunAt', 'endAt'] as const) {
    const value = data[field];
    if (value && Number.isNaN(new Date(value).getTime())) {
      throw new Error(`La fecha ${field} no es válida.`);
    }
  }
};

export const listRecurringDocuments = async ({
  organizationId,
  page = 1,
  limit = 100,
  search = '',
  documentType,
  active,
}: ListRecurringDocumentsParams): Promise<OffsetPaginatedResult<RecurringDocument>> => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(250, Math.max(1, Number(limit) || 100));
  const filter = {
    ...activeScope(organizationId),
    ...(search.trim() ? { name: { $regex: search.trim(), $options: 'i' } } : {}),
    ...(documentType ? { documentType } : {}),
    ...(active === undefined ? {} : { active: active === true || active === 'true' }),
  };
  const [items, total] = await Promise.all([
    model().find(filter).sort({ nextRunAt: 1, name: 1 }).skip((safePage - 1) * safeLimit).limit(safeLimit),
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

export const getRecurringDocument = async (
  recurringId: RecurringDocumentId,
  organizationId: OrganizationId,
): Promise<RecurringDocument> => {
  const recurring = await model().findOne({ _id: recurringId, ...activeScope(organizationId) });
  if (!recurring) throw new Error('El documento recurrente no existe.');
  return recurring;
};

export const createRecurringDocument = async (
  data: Partial<RecurringDocument>,
): Promise<RecurringDocument> => {
  if (!data.organizationId) throw new Error('La organización es obligatoria.');
  if (!data.name?.trim()) throw new Error('El nombre es obligatorio.');
  if (!data.documentType) throw new Error('El tipo de documento es obligatorio.');
  if (!data.frequency) throw new Error('La frecuencia es obligatoria.');
  if (!data.template) throw new Error('La plantilla del documento es obligatoria.');
  validateSchedule(data);

  const startAt = data.startAt ?? new Date().toISOString();
  const nextRunAt = data.nextRunAt ?? startAt;
  return new (model())({
    ...data,
    name: data.name.trim(),
    startAt,
    nextRunAt,
    interval: data.interval ?? 1,
    generatedCount: data.generatedCount ?? 0,
    active: data.active ?? true,
  }).save();
};

export const updateRecurringDocument = async (
  recurringId: RecurringDocumentId,
  organizationId: OrganizationId,
  data: Partial<RecurringDocument>,
): Promise<RecurringDocument> => {
  validateSchedule(data);
  const recurring = await model().findOne({ _id: recurringId, ...activeScope(organizationId) });
  if (!recurring) throw new Error('El documento recurrente no existe.');

  const editable = [
    'name', 'documentType', 'template', 'frequency', 'interval', 'startAt', 'nextRunAt',
    'endAt', 'numberingSeriesId', 'active', 'updatedBy',
  ] as const;
  for (const key of editable) {
    if (data[key] !== undefined) (recurring as any)[key] = data[key];
  }
  if (!recurring.name?.trim()) throw new Error('El nombre es obligatorio.');
  recurring.name = recurring.name.trim();
  await recurring.save();
  return recurring;
};

export const deleteRecurringDocument = async (
  recurringId: RecurringDocumentId,
  organizationId: OrganizationId,
  userId: UserId,
): Promise<RecurringDocument> => {
  const recurring = await model().findOne({ _id: recurringId, ...activeScope(organizationId) });
  if (!recurring) throw new Error('El documento recurrente no existe.');
  recurring.active = false;
  recurring.lifecycleStatus = LifecycleStatus.DELETED;
  recurring.deletedAt = new Date();
  recurring.deletedBy = userId;
  recurring.updatedBy = userId;
  await recurring.save();
  return recurring;
};

export const generateDueRecurringDocuments = async ({
  organizationId,
  userId,
  limit = 100,
}: GenerateDueParams) => {
  const now = new Date();
  const due = await model().find({
    ...activeScope(organizationId),
    active: true,
    nextRunAt: { $lte: now.toISOString() },
    $or: [{ endAt: { $exists: false } }, { endAt: null }, { endAt: { $gte: now.toISOString() } }],
  }).sort({ nextRunAt: 1 }).limit(Math.min(250, Math.max(1, limit)));

  const generated: SalesDocument[] = [];
  const failures: Array<{ recurringId: string; message: string }> = [];
  for (const recurring of due) {
    try {
      const runAt = recurring.nextRunAt;
      const template = recurring.template as Partial<SalesDocument>;
      const templateDate = template.date ? new Date(template.date).getTime() : Number.NaN;
      const templateDueDate = template.dueDate ? new Date(template.dueDate).getTime() : Number.NaN;
      const dueOffset = Number.isNaN(templateDate) || Number.isNaN(templateDueDate)
        ? 0
        : Math.max(0, templateDueDate - templateDate);
      const document = await createDocument({
        ...template,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
        date: runAt,
        dueDate: new Date(new Date(runAt).getTime() + dueOffset).toISOString(),
        numberingSeriesId: recurring.numberingSeriesId ?? template.numberingSeriesId,
        recurringDocumentId: String(recurring.id ?? recurring._id),
      }, recurring.documentType);
      generated.push(document);

      recurring.lastRunAt = runAt;
      recurring.nextRunAt = advanceDate(runAt, recurring.frequency, recurring.interval);
      recurring.generatedCount = Number(recurring.generatedCount ?? 0) + 1;
      recurring.updatedBy = userId;
      if (recurring.endAt && recurring.nextRunAt > recurring.endAt) recurring.active = false;
      await recurring.save();
    } catch (error) {
      failures.push({
        recurringId: String(recurring.id ?? recurring._id),
        message: error instanceof Error ? error.message : 'No se pudo generar el documento.',
      });
    }
  }

  return { processed: due.length, generatedCount: generated.length, generated, failures };
};
