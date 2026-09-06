import { Schema } from 'mongoose';
import { baseFields, opts } from '../../common';
import type { Project, ProjectTask, ProjectTimeEntry } from './project';

const auditFields = {
  ...baseFields,
  organizationId: { type: String, required: true, index: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String, required: true },
  deletedBy: { type: String },
};

export const ProjectSchemaMongo = new Schema<Project>(
  {
    ...auditFields,
    key: { type: String, required: true },
    sequence: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    template: {
      type: String,
      enum: ['blank', 'kanban', 'roadmap', 'goals', 'bug_tracking'],
      default: 'blank',
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'paused', 'completed', 'cancelled'],
      default: 'active',
    },
    visibility: { type: String, enum: ['private', 'organization'], default: 'organization' },
    ownerId: { type: String, required: true, index: true },
    contactId: { type: String, index: true },
    startDate: { type: Date },
    dueDate: { type: Date },
    tags: [{ type: String }],
    lists: [
      {
        _id: false,
        id: { type: String, required: true },
        name: { type: String, required: true },
        color: { type: String, required: true },
        position: { type: Number, required: true },
        isCompleted: { type: Boolean, default: false },
      },
    ],
    features: {
      _id: false,
      summary: { type: Boolean, default: true },
      notes: { type: Boolean, default: true },
      discussions: { type: Boolean, default: true },
      files: { type: Boolean, default: true },
      forms: { type: Boolean, default: false },
      links: { type: Boolean, default: true },
    },
  },
  { ...opts },
);
ProjectSchemaMongo.index({ organizationId: 1, key: 1 }, { unique: true });

export const ProjectTaskSchemaMongo = new Schema<ProjectTask>(
  {
    ...auditFields,
    projectId: { type: String, required: true, index: true },
    listId: { type: String, required: true, index: true },
    key: { type: String, required: true },
    number: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'blocked', 'completed', 'cancelled'],
      default: 'open',
    },
    priority: { type: String, enum: ['none', 'low', 'medium', 'high', 'urgent'], default: 'none' },
    reporterId: { type: String, required: true },
    assigneeIds: [{ type: String, index: true }],
    tags: [{ type: String }],
    estimatedMinutes: { type: Number, min: 0 },
    startDate: { type: Date },
    dueDate: { type: Date },
    completedAt: { type: Date },
    position: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
  },
  { ...opts },
);
ProjectTaskSchemaMongo.index({ organizationId: 1, projectId: 1, number: 1 }, { unique: true });

export const ProjectTimeEntrySchemaMongo = new Schema<ProjectTimeEntry>(
  {
    ...auditFields,
    projectId: { type: String, required: true, index: true },
    taskId: { type: String, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    description: { type: String, default: '' },
    billable: { type: Boolean, default: false },
    hourlyRate: { type: Number, min: 0 },
  },
  { ...opts },
);
