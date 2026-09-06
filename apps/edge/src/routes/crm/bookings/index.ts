import type { RouteOptions } from 'fastify';
import {
  cancelBooking,
  createBooking,
  getBooking,
  listBookings,
  updateBooking,
  getAllWarehouses,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { BookingId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as OrganizationId,
  userId: (req.auth as { userId: UserId }).userId,
});
const id = (req: { params: unknown }) => (req.params as { bookingId: BookingId }).bookingId;
const guard = { organization: 'required', auth: 'required' } as const;

const locations = makeFastifyRoute(RouteMethod.GET, '/locations', verifyJwt, guard, async (req, reply) => {
  reply.status(200).send(await getAllWarehouses({
    organizationId: context(req).organizationId,
    page: 1,
    limit: 100,
    search: '',
  }));
});

const slots = makeFastifyRoute(RouteMethod.GET, '/locations/:locationId/slots', verifyJwt, guard, async (req, reply) => {
  const query = req.query as Record<string, string | undefined>;
  const locationId = (req.params as { locationId: string }).locationId;
  const day = query.date ? new Date(query.date) : new Date();
  if (Number.isNaN(day.getTime())) return reply.status(400).send({ message: 'La fecha no es válida.' });
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const duration = Math.max(15, Number(query.duration ?? 60));
  const existing = await listBookings(context(req).organizationId, {
    locationId,
    serviceId: query.serviceId,
    status: 'confirmed',
    from: start,
    to: end,
  });
  const occupied = new Set(existing.map((booking) => new Date(booking.dateTime).getTime()));
  const available: Array<{ startDate: number; duration: number }> = [];
  for (let minutes = 8 * 60; minutes + duration <= 20 * 60; minutes += 30) {
    const candidate = new Date(start);
    candidate.setMinutes(minutes);
    if (!occupied.has(candidate.getTime()))
      available.push({ startDate: Math.floor(candidate.getTime() / 1000), duration });
  }
  reply.status(200).send(available);
});

const list = makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, guard, async (req, reply) => {
  const query = req.query as Record<string, string | undefined>;
  reply.status(200).send(await listBookings(context(req).organizationId, {
    locationId: query.locationId,
    serviceId: query.serviceId,
    status: query.status as never,
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
  }));
});

const create = makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, guard, async (req, reply) => {
  const { organizationId, userId } = context(req);
  reply.status(201).send(await createBooking(organizationId, userId, req.body as never));
});

const get = makeFastifyRoute(RouteMethod.GET, '/:bookingId', verifyJwt, guard, async (req, reply) => {
  const booking = await getBooking(context(req).organizationId, id(req));
  if (!booking) return reply.status(404).send({ message: 'La reserva no existe.' });
  reply.status(200).send(booking);
});

const update = makeFastifyRoute(RouteMethod.PUT, '/:bookingId', verifyJwt, guard, async (req, reply) => {
  const { organizationId, userId } = context(req);
  reply.status(200).send(await updateBooking(organizationId, userId, id(req), req.body as never));
});

const cancel = makeFastifyRoute(RouteMethod.DELETE, '/:bookingId', verifyJwt, guard, async (req, reply) => {
  const { organizationId, userId } = context(req);
  reply.status(200).send(await cancelBooking(organizationId, userId, id(req)));
});

export const bookingRoutes: RouteOptions[] = withPrefix('/crm/bookings', [locations, slots, list, create, get, update, cancel]);
