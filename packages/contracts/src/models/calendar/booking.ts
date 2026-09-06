import type { BookingId, PersistedSoftDeletableEntity, UserId } from '../../common';

export type BookingStatus = 'confirmed' | 'cancelled';

export interface BookingCustomField {
  key: string;
  value: unknown;
}

export interface Booking extends PersistedSoftDeletableEntity<BookingId, UserId> {
  locationId: string;
  serviceId: string;
  dateTime: Date;
  timezone: string;
  language: string;
  customFields: BookingCustomField[];
  status: BookingStatus;
  cancelledAt?: Date;
}

export interface BookingFilters {
  locationId?: string;
  serviceId?: string;
  status?: BookingStatus;
  from?: Date;
  to?: Date;
}
