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

const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as OrganizationId,
  userId: (req.auth as { userId: UserId }).userId,
});

const list = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const query = req.query as Record<string, string | undefined>;
    reply.status(200).send(
      await listCalendarEvents(context(req).organizationId, {
        from: query.from ? new Date(query.from) : undefined,
        to: query.to ? new Date(query.to) : undefined,
        ownerId: query.ownerId,
        attendeeId: query.attendeeId,
        status: query.status as never,
        relatedEntityType: query.relatedEntityType as never,
        relatedEntityId: query.relatedEntityId,
        search: query.search,
      }),
    );
  },
);

const create = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createCalendarEvent(organizationId, userId, req.body as never));
  },
);

const get = makeFastifyRoute(
  RouteMethod.GET,
  '/:eventId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const event = await getCalendarEvent(
      context(req).organizationId,
      (req.params as { eventId: CalendarEventId }).eventId,
    );
    if (!event) return reply.status(404).send({ message: 'El evento no existe.' });
    reply.status(200).send(event);
  },
);

const update = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:eventId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply
      .status(200)
      .send(
        await updateCalendarEvent(
          organizationId,
          userId,
          (req.params as { eventId: CalendarEventId }).eventId,
          req.body as never,
        ),
      );
  },
);

const remove = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:eventId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    await deleteCalendarEvent(
      organizationId,
      userId,
      (req.params as { eventId: CalendarEventId }).eventId,
    );
    reply.status(200).send(true);
  },
);

export const calendarRoutes: RouteOptions[] = withPrefix('/calendar/events', [
  list,
  create,
  get,
  update,
  remove,
]);
