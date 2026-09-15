import { Collection, getModel } from '@hlb/constant-definitions';
import {
  EmployeeSchemaMongo,
  EmploymentContractSchemaMongo,
  LeaveRequestSchemaMongo,
  LifecycleStatus,
  PayrollRecordSchemaMongo,
  TimeClockEntrySchemaMongo,
  type Employee,
  type EmployeeId,
  type EmploymentContract,
  type EmploymentContractId,
  type LeaveRequest,
  type LeaveRequestId,
  type OrganizationId,
  type PayrollRecord,
  type PayrollRecordId,
  type PayrollStatus,
  type TimeClockEntry,
  type TimeClockEntryId,
  type UserId,
} from '@hlb/contracts';

const employees = () => getModel<Employee>(Collection.EMPLOYEES, EmployeeSchemaMongo);
const contracts = () => getModel<EmploymentContract>(Collection.EMPLOYMENT_CONTRACTS, EmploymentContractSchemaMongo);
const clockEntries = () => getModel<TimeClockEntry>(Collection.TIME_CLOCK_ENTRIES, TimeClockEntrySchemaMongo);
const payroll = () => getModel<PayrollRecord>(Collection.PAYROLL_RECORDS, PayrollRecordSchemaMongo);
const leaves = () => getModel<LeaveRequest>(Collection.LEAVE_REQUESTS, LeaveRequestSchemaMongo);
const activeScope = (organizationId: OrganizationId) => ({ organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } });

const parseDate = (value: unknown, field: string) => {
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) throw new Error(`${field} no contiene una fecha válida.`);
  return date;
};

const assertEmployee = async (employeeId: EmployeeId | undefined, organizationId: OrganizationId) => {
  if (!employeeId) throw new Error('El empleado es obligatorio.');
  const exists = await employees().exists({ _id: employeeId, ...activeScope(organizationId) });
  if (!exists) throw new Error('El empleado no existe en esta organización.');
};

const paging = (page: number | string | undefined, limit: number | string | undefined) => ({
  page: Math.max(Number(page) || 1, 1),
  limit: Math.min(Math.max(Number(limit) || 50, 1), 200),
});

type WorkforceQuery = {
  organizationId: OrganizationId;
  employeeId?: EmployeeId;
  status?: string;
  from?: string | Date;
  to?: string | Date;
  open?: boolean | string;
  page?: number | string;
  limit?: number | string;
};

export const listEmploymentContracts = async (input: WorkforceQuery) => {
  const query: Record<string, unknown> = { ...activeScope(input.organizationId) };
  if (input.employeeId) query.employeeId = input.employeeId;
  if (input.status) query.status = input.status;
  const { page, limit } = paging(input.page, input.limit);
  const [items, total] = await Promise.all([
    contracts().find(query).sort({ startDate: -1 }).skip((page - 1) * limit).limit(limit),
    contracts().countDocuments(query),
  ]);
  return { items, total, page, limit };
};

export const getEmploymentContract = async (contractId: EmploymentContractId, organizationId: OrganizationId) => {
  const contract = await contracts().findOne({ _id: contractId, ...activeScope(organizationId) });
  if (!contract) throw new Error('El contrato laboral no existe.');
  return contract;
};

export const getActiveEmploymentContract = async (employeeId: EmployeeId, organizationId: OrganizationId) => {
  await assertEmployee(employeeId, organizationId);
  const contract = await contracts().findOne({
    ...activeScope(organizationId),
    employeeId,
    status: 'active',
    startDate: { $lte: new Date() },
    $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: new Date() } }],
  }).sort({ startDate: -1 });
  if (!contract) throw new Error('El empleado no tiene un contrato activo.');
  return contract;
};

export const createEmploymentContract = async (data: Partial<EmploymentContract>) => {
  if (!data.organizationId || !data.startDate || !data.position?.trim() || !data.type)
    throw new Error('Empleado, tipo, fecha de inicio y cargo son obligatorios.');
  await assertEmployee(data.employeeId, data.organizationId);
  const startDate = parseDate(data.startDate, 'La fecha de inicio');
  const endDate = data.endDate ? parseDate(data.endDate, 'La fecha de finalización') : undefined;
  if (endDate && endDate < startDate) throw new Error('La fecha final no puede ser anterior a la inicial.');
  return contracts().create({ ...data, startDate, endDate, position: data.position.trim() });
};

export const updateEmploymentContract = async (
  contractId: EmploymentContractId,
  organizationId: OrganizationId,
  data: Partial<EmploymentContract>,
) => {
  const current = await getEmploymentContract(contractId, organizationId);
  if (data.employeeId) await assertEmployee(data.employeeId, organizationId);
  const startDate = data.startDate ? parseDate(data.startDate, 'La fecha de inicio') : current.startDate;
  const endDate = data.endDate === undefined ? current.endDate : data.endDate ? parseDate(data.endDate, 'La fecha de finalización') : undefined;
  if (endDate && endDate < startDate) throw new Error('La fecha final no puede ser anterior a la inicial.');
  const update: Record<string, unknown> = { ...data, startDate };
  if (endDate) update.endDate = endDate;
  else update.$unsetEndDate = true;
  delete update.id;
  delete update.organizationId;
  delete update.createdBy;
  delete update.createdAt;
  delete update.lifecycleStatus;
  const unsetEndDate = update.$unsetEndDate;
  delete update.$unsetEndDate;
  const result = await contracts().findOneAndUpdate(
    { _id: contractId, ...activeScope(organizationId) },
    { $set: update, ...(unsetEndDate ? { $unset: { endDate: 1 } } : {}) },
    { new: true, runValidators: true },
  );
  if (!result) throw new Error('El contrato laboral no existe.');
  return result;
};

export const updateActiveEmploymentContract = async (
  employeeId: EmployeeId,
  organizationId: OrganizationId,
  data: Partial<EmploymentContract>,
) => {
  const contract = await getActiveEmploymentContract(employeeId, organizationId);
  return updateEmploymentContract(contract.id, organizationId, { ...data, employeeId });
};

export const getEmployeeSalary = async (employeeId: EmployeeId, organizationId: OrganizationId) => {
  const contract = await getActiveEmploymentContract(employeeId, organizationId);
  return {
    contractId: contract.id,
    employeeId: contract.employeeId,
    salary: contract.salary,
    currency: contract.currency,
    workdayHours: contract.workdayHours,
    effectiveFrom: contract.startDate,
    effectiveTo: contract.endDate,
    metadata: contract.metadata ?? {},
  };
};

export const getEmployeeSalaryFormData = async (employeeId: EmployeeId, organizationId: OrganizationId) => {
  const salary = await getEmployeeSalary(employeeId, organizationId);
  return {
    salary,
    editableFields: ['salary', 'currency', 'workdayHours', 'effectiveFrom', 'metadata'],
    supportedCurrencies: ['COP', 'USD', 'EUR', 'MXN', 'ARS', 'CLP', 'PEN', 'BRL'],
  };
};

export const updateEmployeeSalary = async (
  employeeId: EmployeeId,
  organizationId: OrganizationId,
  userId: UserId,
  data: { salary?: number; currency?: string; workdayHours?: number; metadata?: Record<string, unknown> },
) => {
  if (data.salary !== undefined && (!Number.isFinite(data.salary) || data.salary < 0))
    throw new Error('El salario no es válido.');
  if (data.workdayHours !== undefined && (!Number.isFinite(data.workdayHours) || data.workdayHours < 0 || data.workdayHours > 24))
    throw new Error('Las horas de jornada no son válidas.');
  return updateActiveEmploymentContract(employeeId, organizationId, {
    ...data,
    currency: data.currency?.trim().toUpperCase(),
    updatedBy: userId,
  });
};

export const deleteEmployeeSalary = async (employeeId: EmployeeId, organizationId: OrganizationId, userId: UserId) => {
  const contract = await getActiveEmploymentContract(employeeId, organizationId);
  const result = await contracts().findOneAndUpdate(
    { _id: contract.id, ...activeScope(organizationId) },
    { $set: { salary: 0, updatedBy: userId }, $unset: { 'metadata.salary': 1 } },
    { new: true, runValidators: true },
  );
  return { employeeId, contractId: contract.id, deleted: true, salary: result?.salary ?? 0 };
};

export const listTimeClockEntries = async (input: WorkforceQuery) => {
  const query: Record<string, unknown> = { ...activeScope(input.organizationId) };
  if (input.employeeId) query.employeeId = input.employeeId;
  if (input.open === true || input.open === 'true') query.clockOut = { $exists: false };
  if (input.from || input.to) query.clockIn = {
    ...(input.from ? { $gte: parseDate(input.from, 'La fecha inicial') } : {}),
    ...(input.to ? { $lte: parseDate(input.to, 'La fecha final') } : {}),
  };
  const { page, limit } = paging(input.page, input.limit);
  const [items, total] = await Promise.all([
    clockEntries().find(query).sort({ clockIn: -1 }).skip((page - 1) * limit).limit(limit),
    clockEntries().countDocuments(query),
  ]);
  return { items, total, page, limit };
};

export const getTimeClockEntry = async (entryId: TimeClockEntryId, organizationId: OrganizationId) => {
  const entry = await clockEntries().findOne({ _id: entryId, ...activeScope(organizationId) });
  if (!entry) throw new Error('El registro horario no existe.');
  return entry;
};

const validateClockRange = (clockIn: Date, clockOut?: Date) => {
  if (clockOut && clockOut <= clockIn) throw new Error('La salida debe ser posterior a la entrada.');
};

export const createTimeClockEntry = async (data: Partial<TimeClockEntry>) => {
  if (!data.organizationId || !data.clockIn) throw new Error('Empleado y hora de entrada son obligatorios.');
  await assertEmployee(data.employeeId, data.organizationId);
  const clockIn = parseDate(data.clockIn, 'La hora de entrada');
  const clockOut = data.clockOut ? parseDate(data.clockOut, 'La hora de salida') : undefined;
  validateClockRange(clockIn, clockOut);
  return clockEntries().create({ ...data, clockIn, clockOut, breaks: data.breaks ?? [], breakMinutes: data.breakMinutes ?? 0 });
};

export const clockInEmployee = async (data: Partial<TimeClockEntry>) => {
  if (!data.organizationId) throw new Error('La organización es obligatoria.');
  await assertEmployee(data.employeeId, data.organizationId);
  const open = await clockEntries().exists({ ...activeScope(data.organizationId), employeeId: data.employeeId, clockOut: { $exists: false } });
  if (open) throw new Error('El empleado ya tiene un fichaje abierto.');
  return createTimeClockEntry({ ...data, clockIn: data.clockIn ?? new Date(), clockOut: undefined });
};

export const updateTimeClockEntry = async (
  entryId: TimeClockEntryId,
  organizationId: OrganizationId,
  userId: UserId,
  data: Partial<TimeClockEntry>,
) => {
  const current = await getTimeClockEntry(entryId, organizationId);
  if (current.approvedAt) throw new Error('No se puede modificar un registro horario aprobado.');
  if (data.employeeId) await assertEmployee(data.employeeId, organizationId);
  const clockIn = data.clockIn ? parseDate(data.clockIn, 'La hora de entrada') : current.clockIn;
  const clockOut = data.clockOut === undefined ? current.clockOut : data.clockOut ? parseDate(data.clockOut, 'La hora de salida') : undefined;
  validateClockRange(clockIn, clockOut);
  const update: Record<string, unknown> = { ...data, clockIn, updatedBy: userId };
  delete update.id;
  delete update.organizationId;
  delete update.createdBy;
  delete update.createdAt;
  delete update.lifecycleStatus;
  if (clockOut) update.clockOut = clockOut;
  const result = await clockEntries().findOneAndUpdate(
    { _id: entryId, ...activeScope(organizationId) },
    { $set: update, ...(!clockOut ? { $unset: { clockOut: 1 } } : {}) },
    { new: true, runValidators: true },
  );
  if (!result) throw new Error('El registro horario no existe.');
  return result;
};

export const deleteTimeClockEntry = async (entryId: TimeClockEntryId, organizationId: OrganizationId) => {
  const entry = await getTimeClockEntry(entryId, organizationId);
  if (entry.approvedAt) throw new Error('No se puede eliminar un registro horario aprobado.');
  await clockEntries().deleteOne({ _id: entryId, organizationId });
  return { id: entryId, deleted: true };
};

export const clockOutEmployee = async (
  entryId: TimeClockEntryId,
  organizationId: OrganizationId,
  userId: UserId,
  data: { clockOut?: Date | string; notes?: string } = {},
) => {
  const entry = await getTimeClockEntry(entryId, organizationId);
  if (entry.clockOut) throw new Error('El fichaje ya está cerrado.');
  if (entry.breaks.some((item) => !item.endedAt)) throw new Error('Finaliza la pausa antes de registrar la salida.');
  const clockOut = data.clockOut ? parseDate(data.clockOut, 'La hora de salida') : new Date();
  validateClockRange(entry.clockIn, clockOut);
  entry.clockOut = clockOut;
  entry.breakMinutes = entry.breaks.reduce((total, item) => total + Math.max(0, Math.round(((item.endedAt?.getTime() ?? item.startedAt.getTime()) - item.startedAt.getTime()) / 60000)), 0);
  if (data.notes !== undefined) entry.notes = data.notes;
  entry.updatedBy = userId;
  await entry.save();
  return entry;
};

export const approveTimeClockEntry = async (entryId: TimeClockEntryId, organizationId: OrganizationId, userId: UserId) => {
  const entry = await getTimeClockEntry(entryId, organizationId);
  if (!entry.clockOut) throw new Error('No se puede aprobar un fichaje abierto.');
  if (entry.approvedAt) throw new Error('El registro horario ya fue aprobado.');
  entry.approvedAt = new Date();
  entry.approvedBy = userId;
  entry.updatedBy = userId;
  await entry.save();
  return entry;
};

const getOpenClockEntry = async (employeeId: EmployeeId, organizationId: OrganizationId) => {
  await assertEmployee(employeeId, organizationId);
  const entry = await clockEntries().findOne({ ...activeScope(organizationId), employeeId, clockOut: { $exists: false } }).sort({ clockIn: -1 });
  if (!entry) throw new Error('El empleado no tiene un fichaje abierto.');
  return entry;
};

export const pauseTimeClockEntry = async (employeeId: EmployeeId, organizationId: OrganizationId, userId: UserId, pausedAt = new Date()) => {
  const entry = await getOpenClockEntry(employeeId, organizationId);
  if (entry.breaks.some((item) => !item.endedAt)) throw new Error('El fichaje ya está en pausa.');
  const date = parseDate(pausedAt, 'La hora de pausa');
  if (date < entry.clockIn) throw new Error('La pausa no puede comenzar antes del fichaje.');
  entry.breaks.push({ startedAt: date });
  entry.updatedBy = userId;
  await entry.save();
  return entry;
};

export const resumeTimeClockEntry = async (employeeId: EmployeeId, organizationId: OrganizationId, userId: UserId, resumedAt = new Date()) => {
  const entry = await getOpenClockEntry(employeeId, organizationId);
  const pause = [...entry.breaks].reverse().find((item) => !item.endedAt);
  if (!pause) throw new Error('El fichaje no está en pausa.');
  const date = parseDate(resumedAt, 'La hora de reanudación');
  if (date <= pause.startedAt) throw new Error('La reanudación debe ser posterior al inicio de la pausa.');
  pause.endedAt = date;
  entry.breakMinutes = entry.breaks.reduce((total, item) => total + (item.endedAt ? Math.round((item.endedAt.getTime() - item.startedAt.getTime()) / 60000) : 0), 0);
  entry.updatedBy = userId;
  entry.markModified('breaks');
  await entry.save();
  return entry;
};

export const listPayrollRecords = async (input: WorkforceQuery) => {
  const query: Record<string, unknown> = { ...activeScope(input.organizationId) };
  if (input.employeeId) query.employeeId = input.employeeId;
  if (input.status) query.status = input.status;
  if (input.from || input.to) query.periodStart = {
    ...(input.from ? { $gte: parseDate(input.from, 'La fecha inicial') } : {}),
    ...(input.to ? { $lte: parseDate(input.to, 'La fecha final') } : {}),
  };
  const { page, limit } = paging(input.page, input.limit);
  const [items, total] = await Promise.all([
    payroll().find(query).sort({ periodStart: -1 }).skip((page - 1) * limit).limit(limit),
    payroll().countDocuments(query),
  ]);
  return { items, total, page, limit };
};

export const createPayrollRecord = async (data: Partial<PayrollRecord>) => {
  if (!data.organizationId || !data.periodStart || !data.periodEnd) throw new Error('Empleado y periodo son obligatorios.');
  await assertEmployee(data.employeeId, data.organizationId);
  const periodStart = parseDate(data.periodStart, 'El inicio del periodo');
  const periodEnd = parseDate(data.periodEnd, 'El final del periodo');
  if (periodEnd < periodStart) throw new Error('El final del periodo no puede ser anterior al inicio.');
  const concepts = data.concepts ?? [];
  if (concepts.some((item) => !item.name?.trim() || !Number.isFinite(item.amount) || item.amount < 0))
    throw new Error('Los conceptos de nómina no son válidos.');
  const calculated = concepts.length ? {
    grossSalary: concepts.filter((item) => item.type === 'earning').reduce((sum, item) => sum + item.amount, 0),
    deductions: concepts.filter((item) => item.type === 'deduction').reduce((sum, item) => sum + item.amount, 0),
    employerContributions: concepts.filter((item) => item.type === 'employer_contribution').reduce((sum, item) => sum + item.amount, 0),
  } : {
    grossSalary: data.grossSalary ?? 0,
    deductions: data.deductions ?? 0,
    employerContributions: data.employerContributions ?? 0,
  };
  return payroll().create({ ...data, ...calculated, netSalary: Math.max(0, calculated.grossSalary - calculated.deductions), periodStart, periodEnd, concepts, status: 'draft' });
};

export const getPayrollRecord = async (recordId: PayrollRecordId, organizationId: OrganizationId) => {
  const record = await payroll().findOne({ _id: recordId, ...activeScope(organizationId) });
  if (!record) throw new Error('El registro de nómina no existe.');
  return record;
};

export const bulkCreatePayrollRecords = async (records: Partial<PayrollRecord>[]) => {
  if (!Array.isArray(records) || records.length === 0) throw new Error('Debes incluir al menos una nómina.');
  if (records.length > 200) throw new Error('Solo se pueden crear hasta 200 nóminas por operación.');
  const created: PayrollRecord[] = [];
  for (const record of records) created.push(await createPayrollRecord(record));
  return { items: created, total: created.length };
};

export const approvePayrollRecord = async (recordId: PayrollRecordId, organizationId: OrganizationId, userId: UserId) => {
  const record = await getPayrollRecord(recordId, organizationId);
  if (record.status !== 'draft') throw new Error('Solo se puede aprobar una nómina en borrador.');
  record.status = 'approved';
  record.approvedAt = new Date();
  record.approvedBy = userId;
  record.updatedBy = userId;
  await record.save();
  return record;
};

export const createPayrollPayment = async (
  recordId: PayrollRecordId,
  organizationId: OrganizationId,
  userId: UserId,
  data: { paymentId?: string; methodId?: string; reference?: string; paidAt?: Date | string; metadata?: Record<string, unknown> },
) => {
  const record = await getPayrollRecord(recordId, organizationId);
  if (record.status !== 'approved') throw new Error('La nómina debe estar aprobada antes de registrar el pago.');
  record.status = 'paid';
  record.paidAt = data.paidAt ? parseDate(data.paidAt, 'La fecha de pago') : new Date();
  record.paymentId = data.paymentId?.trim() || `pay_${record.id}`;
  record.paymentMethodId = data.methodId?.trim();
  record.paymentReference = data.reference?.trim();
  record.paymentMetadata = data.metadata;
  record.updatedBy = userId;
  await record.save();
  return record;
};

export const deletePayrollPayment = async (recordId: PayrollRecordId, organizationId: OrganizationId, userId: UserId) => {
  const record = await getPayrollRecord(recordId, organizationId);
  if (!record.paymentId && record.status !== 'paid') throw new Error('La nómina no tiene un pago registrado.');
  record.status = 'approved';
  record.paidAt = undefined;
  record.paymentId = undefined;
  record.paymentMethodId = undefined;
  record.paymentReference = undefined;
  record.paymentMetadata = undefined;
  record.updatedBy = userId;
  await record.save();
  return record;
};

export const deletePayrollRecord = async (recordId: PayrollRecordId, organizationId: OrganizationId, userId: UserId) => {
  const record = await getPayrollRecord(recordId, organizationId);
  if (record.status === 'paid') throw new Error('Elimina primero el pago asociado a la nómina.');
  record.lifecycleStatus = LifecycleStatus.DELETED;
  record.updatedBy = userId;
  await record.save();
  return { id: recordId, deleted: true };
};

export const updatePayrollStatus = async (recordId: PayrollRecordId, organizationId: OrganizationId, userId: UserId, status: PayrollStatus) => {
  const allowed: Record<PayrollStatus, PayrollStatus[]> = { draft: ['approved', 'cancelled'], approved: ['paid', 'cancelled'], paid: [], cancelled: [] };
  if (!['draft', 'approved', 'paid', 'cancelled'].includes(status)) throw new Error('El estado de nómina no es válido.');
  const record = await payroll().findOne({ _id: recordId, ...activeScope(organizationId) });
  if (!record) throw new Error('El registro de nómina no existe.');
  if (!allowed[record.status].includes(status)) throw new Error(`No se puede cambiar una nómina de ${record.status} a ${status}.`);
  record.status = status;
  record.paidAt = status === 'paid' ? new Date() : undefined;
  record.updatedBy = userId;
  await record.save();
  return record;
};

export const listLeaveRequests = async (input: WorkforceQuery) => {
  const query: Record<string, unknown> = { ...activeScope(input.organizationId) };
  if (input.employeeId) query.employeeId = input.employeeId;
  if (input.status) query.status = input.status;
  const { page, limit } = paging(input.page, input.limit);
  const [items, total] = await Promise.all([
    leaves().find(query).sort({ startDate: -1 }).skip((page - 1) * limit).limit(limit),
    leaves().countDocuments(query),
  ]);
  return { items, total, page, limit };
};

export const createLeaveRequest = async (data: Partial<LeaveRequest>) => {
  if (!data.organizationId || !data.type || !data.startDate || !data.endDate) throw new Error('Empleado, tipo y fechas son obligatorios.');
  await assertEmployee(data.employeeId, data.organizationId);
  const startDate = parseDate(data.startDate, 'La fecha inicial');
  const endDate = parseDate(data.endDate, 'La fecha final');
  if (endDate < startDate) throw new Error('La fecha final no puede ser anterior a la inicial.');
  const overlap = await leaves().exists({ ...activeScope(data.organizationId), employeeId: data.employeeId, status: { $in: ['pending', 'approved'] }, startDate: { $lte: endDate }, endDate: { $gte: startDate } });
  if (overlap) throw new Error('Ya existe una solicitud de ausencia para ese periodo.');
  return leaves().create({ ...data, startDate, endDate, status: 'pending' });
};

export const resolveLeaveRequest = async (requestId: LeaveRequestId, organizationId: OrganizationId, userId: UserId, status: LeaveRequest['status']) => {
  if (!['approved', 'rejected', 'cancelled'].includes(status)) throw new Error('El estado de la solicitud no es válido.');
  const request = await leaves().findOne({ _id: requestId, ...activeScope(organizationId) });
  if (!request) throw new Error('La solicitud de ausencia no existe.');
  if (request.status !== 'pending') throw new Error('La solicitud de ausencia ya fue resuelta.');
  request.status = status;
  request.resolvedAt = new Date();
  request.resolvedBy = userId;
  request.updatedBy = userId;
  await request.save();
  return request;
};
