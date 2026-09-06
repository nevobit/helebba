import type {
  ContactId,
  PersistedSoftDeletableEntity,
  ProjectId,
  ProjectListId,
  ProjectTaskId,
  ProjectTimeEntryId,
  UserId,
} from '../../common';

export type ProjectTemplate = 'blank' | 'kanban' | 'roadmap' | 'goals' | 'bug_tracking';
export type ProjectStatus = 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
export type ProjectTaskStatus = 'open' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type ProjectTaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectList {
  id: ProjectListId;
  name: string;
  color: string;
  position: number;
  isCompleted: boolean;
}

export interface Project extends PersistedSoftDeletableEntity<ProjectId, UserId> {
  key: string;
  sequence: number;
  name: string;
  description: string;
  template: ProjectTemplate;
  status: ProjectStatus;
  visibility: 'private' | 'organization';
  ownerId: UserId;
  contactId?: ContactId;
  startDate?: Date;
  dueDate?: Date;
  tags: string[];
  lists: ProjectList[];
  features: {
    summary: boolean;
    notes: boolean;
    discussions: boolean;
    files: boolean;
    forms: boolean;
    links: boolean;
  };
}

export interface ProjectTask extends PersistedSoftDeletableEntity<ProjectTaskId, UserId> {
  projectId: ProjectId;
  listId: ProjectListId;
  key: string;
  number: number;
  name: string;
  description: string;
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  reporterId: UserId;
  assigneeIds: UserId[];
  tags: string[];
  estimatedMinutes?: number;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  position: number;
  archived: boolean;
}

export interface ProjectTimeEntry extends PersistedSoftDeletableEntity<
  ProjectTimeEntryId,
  UserId
> {
  projectId: ProjectId;
  taskId?: ProjectTaskId;
  userId: UserId;
  date: Date;
  durationMinutes: number;
  description: string;
  billable: boolean;
  hourlyRate?: number;
}

export interface ProjectTaskFilters {
  projectId?: string;
  listId?: string;
  assigneeId?: string;
  status?: ProjectTaskStatus;
  priority?: ProjectTaskPriority;
  search?: string;
  archived?: boolean;
}
