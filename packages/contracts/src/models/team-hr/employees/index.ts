import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type {
  EmployeeId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../../common';

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

export interface Employee extends PersistedSoftDeletableEntity<EmployeeId, UserId> {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  employeeNumber: string;
  jobTitle: string;
  department: string;
  status: EmployeeStatus;
  hireDate?: Date;
  terminationDate?: Date;
  userId?: UserId;
  managerId?: EmployeeId;
  identification?: string;
  address?: string;
  metadata?: Record<string, unknown>;
}

export const EmployeeSchemaMongo = new Schema<Employee>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    phone: { type: String, default: '' },
    employeeNumber: { type: String, default: '' },
    jobTitle: { type: String, default: '' },
    department: { type: String, default: '' },
    status: { type: String, default: 'active' },
    hireDate: { type: Date },
    terminationDate: { type: Date },
    userId: { type: String },
    managerId: { type: String },
    identification: { type: String },
    address: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { ...opts },
);

EmployeeSchemaMongo.index(
  { organizationId: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string', $ne: '' } } },
);
