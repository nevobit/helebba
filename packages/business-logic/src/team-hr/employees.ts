import { Collection, getModel } from '@hlb/constant-definitions';
import {
  EmployeeSchemaMongo,
  LifecycleStatus,
  type Employee,
  type EmployeeId,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

const employees = () => getModel<Employee>(Collection.EMPLOYEES, EmployeeSchemaMongo);
const scope = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
});

type EmployeeQuery = {
  organizationId: OrganizationId;
  search?: string;
  status?: Employee['status'];
  department?: string;
  managerId?: EmployeeId;
  page?: number | string;
  limit?: number | string;
};

export const listEmployees = async ({
  organizationId,
  search,
  status,
  department,
  managerId,
  page = 1,
  limit = 50,
}: EmployeeQuery) => {
  const query: Record<string, unknown> = { ...scope(organizationId) };
  if (status) query.status = status;
  if (department) query.department = department;
  if (managerId) query.managerId = managerId;
  if (search?.trim()) {
    const value = { $regex: search.trim(), $options: 'i' };
    query.$or = [
      { firstName: value },
      { lastName: value },
      { email: value },
      { employeeNumber: value },
      { jobTitle: value },
    ];
  }
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const [items, total] = await Promise.all([
    employees().find(query).sort({ firstName: 1, lastName: 1 }).skip((safePage - 1) * safeLimit).limit(safeLimit),
    employees().countDocuments(query),
  ]);
  return { items, total, page: safePage, limit: safeLimit };
};

export const getEmployee = async (employeeId: EmployeeId, organizationId: OrganizationId) => {
  const employee = await employees().findOne({ _id: employeeId, ...scope(organizationId) });
  if (!employee) throw new Error('El empleado no existe.');
  return employee;
};

const validateManager = async (
  organizationId: OrganizationId,
  managerId?: EmployeeId,
  employeeId?: EmployeeId,
) => {
  if (!managerId) return;
  if (employeeId && String(managerId) === String(employeeId))
    throw new Error('Un empleado no puede ser su propio responsable.');
  const manager = await employees().exists({ _id: managerId, ...scope(organizationId) });
  if (!manager) throw new Error('El responsable seleccionado no existe.');
};

export const createEmployee = async (data: Partial<Employee>) => {
  if (!data.organizationId || !data.firstName?.trim())
    throw new Error('La organización y el nombre son obligatorios.');
  await validateManager(data.organizationId, data.managerId);
  return employees().create({
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName?.trim() ?? '',
    email: data.email?.trim().toLowerCase() ?? '',
    status: data.status ?? 'active',
  });
};

export const updateEmployee = async (
  employeeId: EmployeeId,
  organizationId: OrganizationId,
  data: Partial<Employee>,
) => {
  if (data.firstName !== undefined && !data.firstName.trim())
    throw new Error('El nombre del empleado no puede estar vacío.');
  await validateManager(organizationId, data.managerId, employeeId);
  const update: Record<string, unknown> = { ...data };
  delete update.id;
  delete update.organizationId;
  delete update.createdBy;
  delete update.createdAt;
  delete update.lifecycleStatus;
  delete update.deletedAt;
  delete update.deletedBy;
  if (typeof data.firstName === 'string') update.firstName = data.firstName.trim();
  if (typeof data.lastName === 'string') update.lastName = data.lastName.trim();
  if (typeof data.email === 'string') update.email = data.email.trim().toLowerCase();
  const employee = await employees().findOneAndUpdate(
    { _id: employeeId, ...scope(organizationId) },
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!employee) throw new Error('El empleado no existe.');
  return employee;
};

export const deleteEmployee = async (
  employeeId: EmployeeId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const employee = await employees().findOneAndUpdate(
    { _id: employeeId, ...scope(organizationId) },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
      },
    },
    { new: true },
  );
  if (!employee) throw new Error('El empleado no existe o ya fue eliminado.');
  await employees().updateMany(
    { ...scope(organizationId), managerId: employeeId },
    { $unset: { managerId: 1 }, $set: { updatedBy: userId } },
  );
  return employee;
};
