import type {
  CalendarEventId,
  ContactId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../common';

export type CalendarEventStatus = 'confirmed' | 'tentative' | 'cancelled';
export type CalendarEventVisibility = 'private' | 'organization';
export type CalendarRelatedEntityType = 'contact' | 'crm_opportunity' | 'project' | 'project_task';

export interface CalendarEventReminder {
  method: 'email' | 'notification';
  minutesBefore: number;
}

export interface CalendarEvent extends PersistedSoftDeletableEntity<CalendarEventId, UserId> {
  title: string;
  description: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  timezone: string;
  status: CalendarEventStatus;
  visibility: CalendarEventVisibility;
  ownerId: UserId;
  attendeeIds: UserId[];
  attendeeEmails: string[];
  reminders: CalendarEventReminder[];
  color?: string;
  contactId?: ContactId;
  contactName?: string;
  kind?: string;
  tags?: string[];
  leadId?: string;
  funnelId?: string;
  relatedEntityType?: CalendarRelatedEntityType;
  relatedEntityId?: string;
  recurrenceRule?: string;
}

export interface CalendarEventFilters {
  from?: Date;
  to?: Date;
  ownerId?: string;
  attendeeId?: string;
  status?: CalendarEventStatus;
  relatedEntityType?: CalendarRelatedEntityType;
  relatedEntityId?: string;
  search?: string;
}
