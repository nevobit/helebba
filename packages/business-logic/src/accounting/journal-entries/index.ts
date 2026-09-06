import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ExpenseAccountSchemaMongo,
  JournalEntrySchemaMongo,
  LifecycleStatus,
  type ExpenseAccount,
  type JournalEntry,
  type JournalEntryId,
  type JournalEntryLine,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

const entries = () =>
  getModel<JournalEntry>(Collection.JOURNAL_ENTRIES, JournalEntrySchemaMongo);

const scope = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
});

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const validateLines = async (organizationId: OrganizationId, lines: JournalEntryLine[]) => {
  if (!Array.isArray(lines) || lines.length < 2)
    throw new Error('El asiento debe tener al menos dos líneas.');

  for (const line of lines) {
    if (!line.accountId) throw new Error('Todas las líneas deben tener una cuenta contable.');
    if (!Number.isFinite(line.debit) || !Number.isFinite(line.credit) || line.debit < 0 || line.credit < 0)
      throw new Error('Los débitos y créditos deben ser números iguales o mayores que cero.');
    if ((line.debit > 0 && line.credit > 0) || (line.debit === 0 && line.credit === 0))
      throw new Error('Cada línea debe tener un débito o un crédito, pero no ambos.');
  }

  const accountIds = [...new Set(lines.map(({ accountId }) => String(accountId)))];
  const accountModel = getModel<ExpenseAccount>(Collection.EXPENSE_ACCOUNTS, ExpenseAccountSchemaMongo);
  const accountCount = await accountModel.countDocuments({
    _id: { $in: accountIds },
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (accountCount !== accountIds.length)
    throw new Error('Una o más cuentas contables no existen en esta organización.');

  const totalDebit = roundMoney(lines.reduce((sum, line) => sum + line.debit, 0));
  const totalCredit = roundMoney(lines.reduce((sum, line) => sum + line.credit, 0));
  if (totalDebit <= 0 || totalDebit !== totalCredit)
    throw new Error('El asiento no está cuadrado: el total del debe debe coincidir con el haber.');
  return { totalDebit, totalCredit };
};

type JournalEntryQuery = {
  organizationId: OrganizationId;
  search?: string;
  status?: JournalEntry['status'];
  from?: string | Date;
  to?: string | Date;
  page?: number | string;
  limit?: number | string;
};

export const listJournalEntries = async ({
  organizationId,
  search,
  status,
  from,
  to,
  page = 1,
  limit = 50,
}: JournalEntryQuery) => {
  const query: Record<string, unknown> = { ...scope(organizationId) };
  if (status) query.status = status;
  if (search?.trim()) {
    const value = { $regex: search.trim(), $options: 'i' };
    query.$or = [{ number: value }, { description: value }, { reference: value }];
  }
  if (from || to) {
    query.date = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };
  }
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const safePage = Math.max(Number(page) || 1, 1);
  return entries().find(query).sort({ date: -1, createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit);
};

export const getJournalEntry = async (
  journalEntryId: JournalEntryId,
  organizationId: OrganizationId,
) => {
  const entry = await entries().findOne({ _id: journalEntryId, ...scope(organizationId) });
  if (!entry) throw new Error('El asiento contable no existe.');
  return entry;
};

export const createJournalEntry = async (data: Partial<JournalEntry>) => {
  if (!data.organizationId || !data.number?.trim() || !data.date)
    throw new Error('Organización, número y fecha son obligatorios.');
  const lines = data.lines ?? [];
  const totals = await validateLines(data.organizationId, lines);
  return entries().create({
    ...data,
    number: data.number.trim(),
    status: 'draft',
    lines,
    ...totals,
    postedAt: undefined,
    postedBy: undefined,
    voidedAt: undefined,
    voidedBy: undefined,
  });
};

export const updateJournalEntry = async (
  journalEntryId: JournalEntryId,
  organizationId: OrganizationId,
  data: Partial<JournalEntry>,
) => {
  const current = await getJournalEntry(journalEntryId, organizationId);
  if (current.status !== 'draft') throw new Error('Solo se pueden editar asientos en borrador.');
  const lines = data.lines ?? current.lines;
  const totals = await validateLines(organizationId, lines);
  const number = data.number === undefined ? current.number : data.number.trim();
  if (!number) throw new Error('El número del asiento es obligatorio.');
  const updated = await entries().findOneAndUpdate(
    { _id: journalEntryId, ...scope(organizationId), status: 'draft' },
    {
      $set: {
        number,
        date: data.date ?? current.date,
        description: data.description ?? current.description,
        reference: data.reference ?? current.reference,
        metadata: data.metadata ?? current.metadata,
        updatedBy: data.updatedBy,
        lines,
        ...totals,
      },
    },
    { new: true, runValidators: true },
  );
  if (!updated) throw new Error('El asiento contable no existe o ya no se puede editar.');
  return updated;
};

export const postJournalEntry = async (
  journalEntryId: JournalEntryId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const current = await getJournalEntry(journalEntryId, organizationId);
  if (current.status !== 'draft') throw new Error('Solo se pueden contabilizar asientos en borrador.');
  await validateLines(organizationId, current.lines);
  current.status = 'posted';
  current.postedAt = new Date();
  current.postedBy = userId;
  current.updatedBy = userId;
  await current.save();
  return current;
};

export const voidJournalEntry = async (
  journalEntryId: JournalEntryId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const current = await getJournalEntry(journalEntryId, organizationId);
  if (current.status !== 'posted') throw new Error('Solo se pueden anular asientos contabilizados.');
  current.status = 'void';
  current.voidedAt = new Date();
  current.voidedBy = userId;
  current.updatedBy = userId;
  await current.save();
  return current;
};

export const deleteJournalEntry = async (
  journalEntryId: JournalEntryId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const current = await getJournalEntry(journalEntryId, organizationId);
  if (current.status !== 'draft') throw new Error('Solo se pueden eliminar asientos en borrador.');
  current.lifecycleStatus = LifecycleStatus.DELETED;
  current.deletedAt = new Date();
  current.deletedBy = userId;
  current.updatedBy = userId;
  await current.save();
  return current;
};
