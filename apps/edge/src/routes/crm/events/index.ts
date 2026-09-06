import type { RouteOptions } from 'fastify';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { CalendarEventId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type HoldedEventInput = {
  name?: string;
  contactId?: string;
  contactName?: string;
  kind?: string;
  desc?: string;
  startDate?: number | string;
  duration?: number | string;
  status?: number | string;
  tags?: string[];
  locationDesc?: string;
  leadId?: string;
  funnelId?: string;
  userId?: string;
};

const guard = { organization: 'required', auth: 'required' } as const;
const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as OrganizationId,
  userId: (req.auth as { userId: UserId }).userId,
});
const eventId = (req: { params: unknown }) =>
  (req.params as { eventId: CalendarEventId }).eventId;
const timestamp = (value: number | string | undefined) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  return new Date(numeric < 10_000_000_000 ? numeric * 1000 : numeric);
};
const holdedStatus = (value: number | string | undefined) => {
  if (value === 0 || value === '0') return 'tentative';
  if (value === 2 || value === '2') return 'cancelled';
  return 'confirmed';
};
const input = (body: HoldedEventInput, partial = false) => {
  const startsAt = timestamp(body.startDate);
  const duration = Number(body.duration ?? 0);
  const mapped: Record<string, unknown> = {};
  if (!partial || body.name !== undefined) mapped.title = body.name;
  if (!partial || body.desc !== undefined) mapped.description = body.desc ?? '';
  if (!partial || body.locationDesc !== undefined) mapped.location = body.locationDesc ?? '';
  if (!partial || body.startDate !== undefined) mapped.startsAt = startsAt;
  if (!partial || body.startDate !== undefined || body.duration !== undefined)
    mapped.endsAt = startsAt ? new Date(startsAt.getTime() + Math.max(0, duration) * 60_000) : undefined;
  if (!partial || body.status !== undefined) mapped.status = holdedStatus(body.status);
  if (!partial || body.userId !== undefined) mapped.ownerId = body.userId;
  for (const [source, target] of [
    ['contactId', 'contactId'],
    ['contactName', 'contactName'],
    ['kind', 'kind'],
    ['tags', 'tags'],
    ['leadId', 'leadId'],
    ['funnelId', 'funnelId'],
  ] as const)
    if (!partial || body[source] !== undefined) mapped[target] = body[source];
  return mapped;
};

const list = makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, guard, async (req, reply) => {
  reply.status(200).send(await listCalendarEvents(context(req).organizationId));
});
const create = makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, guard, async (req, reply) => {
  const { organizationId, userId } = context(req);
  reply.status(201).send(await createCalendarEvent(organizationId, userId, input(req.body as HoldedEventInput) as never));
});
const get = makeFastifyRoute(RouteMethod.GET, '/:eventId', verifyJwt, guard, async (req, reply) => {
  const event = await getCalendarEvent(context(req).organizationId, eventId(req));
  if (!event) return reply.status(404).send({ message: 'El evento no existe.' });
  reply.status(200).send(event);
});
const update = makeFastifyRoute(RouteMethod.PUT, '/:eventId', verifyJwt, guard, async (req, reply) => {
  const { organizationId, userId } = context(req);
  reply.status(200).send(await updateCalendarEvent(organizationId, userId, eventId(req), input(req.body as HoldedEventInput, true) as never));
});
const remove = makeFastifyRoute(RouteMethod.DELETE, '/:eventId', verifyJwt, guard, async (req, reply) => {
  const { organizationId, userId } = context(req);
  await deleteCalendarEvent(organizationId, userId, eventId(req));
  reply.status(200).send(true);
});

export const crmEventRoutes: RouteOptions[] = withPrefix('/crm/events', [list, create, get, update, remove]);
