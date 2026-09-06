import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type {
  EmployeeId,
  EmploymentContractId,
  LeaveRequestId,
  PayrollRecordId,
  PersistedEntity,
  TimeClockEntryId,
  UserId,
} from '../../../common';

export type EmploymentContractType = 'permanent' | 'temporary' | 'contractor' | 'internship';
export type EmploymentContractStatus = 'draft' | 'active' | 'ended' | 'cancelled';

export interface EmploymentContract extends PersistedEntity<EmploymentContractId, UserId> {
  employeeId: EmployeeId;
  type: EmploymentContractType;
  status: EmploymentContractStatus;
  startDate: Date;
  endDate?: Date;
  position: string;
  department: string;
  workdayHours: number;
  salary: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export const EmploymentContractSchemaMongo = new Schema<EmploymentContract>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    employeeId: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: ['permanent', 'temporary', 'contractor', 'internship'] },
    status: { type: String, required: true, enum: ['draft', 'active', 'ended', 'cancelled'], default: 'draft' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    position: { type: String, required: true, trim: true },
    department: { type: String, default: '', trim: true },
    workdayHours: { type: Number, default: 8, min: 0, max: 24 },
    salary: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { ...opts },
);
EmploymentContractSchemaMongo.index({ organizationId: 1, employeeId: 1, status: 1 });

export type TimeClockSource = 'web' | 'mobile' | 'manual' | 'api';
export interface TimeClockBreak {
  startedAt: Date;
  endedAt?: Date;
}
export interface TimeClockEntry extends PersistedEntity<TimeClockEntryId, UserId> {
  employeeId: EmployeeId;
  clockIn: Date;
  clockOut?: Date;
  breakMinutes: number;
  breaks: TimeClockBreak[];
  source: TimeClockSource;
  notes?: string;
  approvedAt?: Date;
  approvedBy?: UserId;
}

const TimeClockBreakSchema = new Schema<TimeClockBreak>(
  {
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
  },
  { _id: false },
);

export const TimeClockEntrySchemaMongo = new Schema<TimeClockEntry>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    employeeId: { type: String, required: true, index: true },
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
    breakMinutes: { type: Number, default: 0, min: 0 },
    breaks: { type: [TimeClockBreakSchema], default: [] },
    source: { type: String, enum: ['web', 'mobile', 'manual', 'api'], default: 'web' },
    notes: { type: String, default: '' },
    approvedAt: { type: Date },
    approvedBy: { type: String },
  },
  { ...opts },
);
TimeClockEntrySchemaMongo.index({ organizationId: 1, employeeId: 1, clockIn: -1 });

export interface PayrollConcept {
  name: string;
  type: 'earning' | 'deduction' | 'employer_contribution';
  amount: number;
}
export type PayrollStatus = 'draft' | 'approved' | 'paid' | 'cancelled';
export interface PayrollRecord extends PersistedEntity<PayrollRecordId, UserId> {
  employeeId: EmployeeId;
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  grossSalary: number;
  deductions: number;
  employerContributions: number;
  netSalary: number;
  concepts: PayrollConcept[];
  status: PayrollStatus;
  paidAt?: Date;
}

const PayrollConceptSchema = new Schema<PayrollConcept>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['earning', 'deduction', 'employer_contribution'] },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);
export const PayrollRecordSchemaMongo = new Schema<PayrollRecord>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    employeeId: { type: String, required: true, index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    currency: { type: String, default: 'USD', uppercase: true, trim: true },
    grossSalary: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    employerContributions: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, default: 0, min: 0 },
    concepts: { type: [PayrollConceptSchema], default: [] },
    status: { type: String, enum: ['draft', 'approved', 'paid', 'cancelled'], default: 'draft' },
    paidAt: { type: Date },
  },
  { ...opts },
);
PayrollRecordSchemaMongo.index({ organizationId: 1, employeeId: 1, periodStart: -1 });

export type LeaveRequestType = 'vacation' | 'sick' | 'personal' | 'other';
export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export interface LeaveRequest extends PersistedEntity<LeaveRequestId, UserId> {
  employeeId: EmployeeId;
  type: LeaveRequestType;
  startDate: Date;
  endDate: Date;
  hours?: number;
  reason?: string;
  status: LeaveRequestStatus;
  resolvedAt?: Date;
  resolvedBy?: UserId;
}

export const LeaveRequestSchemaMongo = new Schema<LeaveRequest>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    employeeId: { type: String, required: true, index: true },
    type: { type: String, enum: ['vacation', 'sick', 'personal', 'other'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    hours: { type: Number, min: 0 },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    resolvedAt: { type: Date },
    resolvedBy: { type: String },
  },
  { ...opts },
);
LeaveRequestSchemaMongo.index({ organizationId: 1, employeeId: 1, startDate: -1 });
