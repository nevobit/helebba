import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CalendarEventSchemaMongo,
  BookingSchemaMongo,
  LifecycleStatus,
  type CalendarEvent,
  type CalendarEventFilters,
  type CalendarEventId,
  type Booking,
  type BookingFilters,
  type BookingId,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';
import { queueWebhookEvent } from '../developers/webhooks';

const events = () => getModel<CalendarEvent>(Collection.CALENDAR_EVENTS, CalendarEventSchemaMongo);
const bookings = () => getModel<Booking>(Collection.BOOKINGS, BookingSchemaMongo);

type BookingInput = Pick<
  Booking,
  'locationId' | 'serviceId' | 'dateTime' | 'timezone' | 'language' | 'customFields'
>;

const bookingQuery = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
});

export const listBookings = async (
  organizationId: OrganizationId,
  filters: BookingFilters = {},
) => {
  const query: Record<string, unknown> = bookingQuery(organizationId);
  if (filters.locationId) query.locationId = filters.locationId;
  if (filters.serviceId) query.serviceId = filters.serviceId;
  if (filters.status) query.status = filters.status;
  if (filters.from || filters.to)
    query.dateTime = {
      ...(filters.from ? { $gte: filters.from } : {}),
      ...(filters.to ? { $lte: filters.to } : {}),
    };
  return bookings().find(query).sort({ dateTime: 1 });
};

export const getBooking = (organizationId: OrganizationId, bookingId: BookingId) =>
  bookings().findOne({ _id: bookingId, ...bookingQuery(organizationId) });

export const createBooking = async (
  organizationId: OrganizationId,
  userId: UserId,
  input: BookingInput,
) => {
  if (!input.locationId || !input.serviceId || !input.timezone || !input.language)
    throw new Error('Ubicación, servicio, zona horaria e idioma son obligatorios.');
  const dateTime = new Date(input.dateTime);
  if (Number.isNaN(dateTime.getTime())) throw new Error('La fecha de la reserva no es válida.');
  const booking = await bookings().create({
    ...input,
    dateTime,
    customFields: input.customFields ?? [],
    status: 'confirmed',
    organizationId,
    createdBy: userId,
    updatedBy: userId,
  });
  queueWebhookEvent(organizationId, userId, 'booking.created', { booking: booking.toObject() });
  return booking;
};

export const updateBooking = async (
  organizationId: OrganizationId,
  userId: UserId,
  bookingId: BookingId,
  input: Partial<Pick<Booking, 'dateTime' | 'customFields'>>,
) => {
  const update: Record<string, unknown> = { updatedBy: userId };
  if (input.dateTime !== undefined) {
    const dateTime = new Date(input.dateTime);
    if (Number.isNaN(dateTime.getTime())) throw new Error('La fecha de la reserva no es válida.');
    update.dateTime = dateTime;
  }
  if (input.customFields !== undefined) update.customFields = input.customFields;
  const booking = await bookings().findOneAndUpdate(
    { _id: bookingId, ...bookingQuery(organizationId) },
    { $set: update },
    { new: true },
  );
  if (!booking) throw new Error('La reserva no existe.');
  queueWebhookEvent(organizationId, userId, 'booking.updated', { booking: booking.toObject() });
  return booking;
};

export const cancelBooking = async (
  organizationId: OrganizationId,
  userId: UserId,
  bookingId: BookingId,
) => {
  const booking = await bookings().findOneAndUpdate(
    { _id: bookingId, ...bookingQuery(organizationId) },
    { $set: { status: 'cancelled', cancelledAt: new Date(), updatedBy: userId } },
    { new: true },
  );
  if (!booking) throw new Error('La reserva no existe.');
  queueWebhookEvent(organizationId, userId, 'booking.cancelled', { bookingId });
  return booking;
};

type CalendarEventInput = Omit<
  CalendarEvent,
  | 'id'
  | 'organizationId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'deletedAt'
  | 'deletedBy'
  | 'lifecycleStatus'
  | 'ownerId'
> & { ownerId?: UserId };

const normalizeDates = (input: Partial<CalendarEventInput>, current?: CalendarEvent) => {
  const startsAt = input.startsAt ? new Date(input.startsAt) : current?.startsAt;
  const endsAt = input.endsAt ? new Date(input.endsAt) : current?.endsAt;
  if (!startsAt || !endsAt || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()))
    throw new Error('Selecciona fechas válidas para el evento.');
  if (endsAt <= startsAt) throw new Error('La fecha final debe ser posterior a la inicial.');
  return { startsAt, endsAt };
};

export const listCalendarEvents = async (
  organizationId: OrganizationId,
  filters: CalendarEventFilters = {},
) => {
  const query: Record<string, unknown> = {
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  };
  if (filters.from || filters.to) {
    query.startsAt = { ...(filters.to ? { $lte: filters.to } : {}) };
    query.endsAt = { ...(filters.from ? { $gte: filters.from } : {}) };
  }
  if (filters.ownerId) query.ownerId = filters.ownerId;
  if (filters.attendeeId) query.attendeeIds = filters.attendeeId;
  if (filters.status) query.status = filters.status;
  if (filters.relatedEntityType) query.relatedEntityType = filters.relatedEntityType;
  if (filters.relatedEntityId) query.relatedEntityId = filters.relatedEntityId;
  if (filters.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
      { location: { $regex: escaped, $options: 'i' } },
    ];
  }
  return events().find(query).sort({ startsAt: 1 });
};

export const createCalendarEvent = async (
  organizationId: OrganizationId,
  userId: UserId,
  input: CalendarEventInput,
) => {
  if (!input.title?.trim()) throw new Error('Ingresa el título del evento.');
  const dates = normalizeDates(input);
  const event = await events().create({
    ...input,
    ...dates,
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    location: input.location?.trim() ?? '',
    organizationId,
    ownerId: input.ownerId ?? userId,
    attendeeIds: input.attendeeIds ?? [],
    attendeeEmails: input.attendeeEmails ?? [],
    reminders: input.reminders ?? [],
    createdBy: userId,
    updatedBy: userId,
  });
  queueWebhookEvent(organizationId, userId, 'calendar.event.created', {
    event: event.toObject(),
  });
  return event;
};

export const getCalendarEvent = async (organizationId: OrganizationId, eventId: CalendarEventId) =>
  events().findOne({
    _id: eventId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });

export const updateCalendarEvent = async (
  organizationId: OrganizationId,
  userId: UserId,
  eventId: CalendarEventId,
  input: Partial<CalendarEventInput>,
) => {
  const current = await getCalendarEvent(organizationId, eventId);
  if (!current) throw new Error('El evento no existe.');
  if (input.title !== undefined && !input.title.trim())
    throw new Error('Ingresa el título del evento.');
  const dates = normalizeDates(input, current);
  const allowed = [
    'title',
    'description',
    'location',
    'allDay',
    'timezone',
    'status',
    'visibility',
    'ownerId',
    'attendeeIds',
    'attendeeEmails',
    'reminders',
    'color',
    'contactId',
    'contactName',
    'kind',
    'tags',
    'leadId',
    'funnelId',
    'relatedEntityType',
    'relatedEntityId',
    'recurrenceRule',
  ] as const;
  const update: Record<string, unknown> = { ...dates, updatedBy: userId };
  for (const key of allowed) if (input[key] !== undefined) update[key] = input[key];
  if (typeof update.title === 'string') update.title = update.title.trim();
  const event = await events().findOneAndUpdate(
    { _id: eventId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    { $set: update },
    { new: true },
  );
  if (event) {
    queueWebhookEvent(organizationId, userId, 'calendar.event.updated', {
      event: event.toObject(),
    });
  }
  return event;
};

export const deleteCalendarEvent = async (
  organizationId: OrganizationId,
  userId: UserId,
  eventId: CalendarEventId,
) => {
  const event = await events().findOneAndUpdate(
    { _id: eventId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
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
  if (!event) throw new Error('El evento no existe.');
  queueWebhookEvent(organizationId, userId, 'calendar.event.deleted', { eventId });
  return true;
};
