import type { RouteOptions } from 'fastify';
import {
  createWebhookSubscription,
  deleteWebhookSubscription,
  emitWebhookEvent,
  getWebhookSubscription,
  listWebhookEventTypes,
  listWebhookDeliveries,
  listWebhookSubscriptions,
  retryWebhookDelivery,
  rotateWebhookSecret,
  setWebhookSubscriptionActive,
  updateWebhookSubscription,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type {
  OrganizationId,
  UserId,
  WebhookDeliveryId,
  WebhookSubscriptionId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as OrganizationId,
  userId: (req.auth as { userId: UserId }).userId,
});
const guard = [verifyJwt, { organization: 'required', auth: 'required' }] as const;

const list = makeFastifyRoute(RouteMethod.GET, '/', ...guard, async (req, reply) => {
  reply.status(200).send(await listWebhookSubscriptions(context(req).organizationId));
});

const create = makeFastifyRoute(RouteMethod.POST, '/', ...guard, async (req, reply) => {
  const { organizationId, userId } = context(req);
  reply
    .status(201)
    .send(await createWebhookSubscription(organizationId, userId, req.body as never));
});

const eventTypes = makeFastifyRoute(RouteMethod.GET, '/event-types', ...guard, async (_req, reply) => {
  reply.status(200).send(listWebhookEventTypes());
});

const get = makeFastifyRoute(
  RouteMethod.GET,
  '/:subscriptionId',
  ...guard,
  async (req, reply) => {
    const webhook = await getWebhookSubscription(
      context(req).organizationId,
      (req.params as { subscriptionId: WebhookSubscriptionId }).subscriptionId,
    );
    if (!webhook) return void reply.status(404).send({ message: 'El webhook no existe.' });
    reply.status(200).send(webhook);
  },
);

const activeRoute = (active: boolean) =>
  makeFastifyRoute(
    RouteMethod.POST,
    `/:subscriptionId/${active ? 'enable' : 'disable'}`,
    ...guard,
    async (req, reply) => {
      const { organizationId, userId } = context(req);
      reply.status(200).send(
        await setWebhookSubscriptionActive(
          organizationId,
          userId,
          (req.params as { subscriptionId: WebhookSubscriptionId }).subscriptionId,
          active,
        ),
      );
    },
  );

const update = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:subscriptionId',
  ...guard,
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply
      .status(200)
      .send(
        await updateWebhookSubscription(
          organizationId,
          userId,
          (req.params as { subscriptionId: WebhookSubscriptionId }).subscriptionId,
          req.body as never,
        ),
      );
  },
);

const remove = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:subscriptionId',
  ...guard,
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    await deleteWebhookSubscription(
      organizationId,
      userId,
      (req.params as { subscriptionId: WebhookSubscriptionId }).subscriptionId,
    );
    reply.status(200).send(true);
  },
);

const rotateSecret = makeFastifyRoute(
  RouteMethod.POST,
  '/:subscriptionId/rotate-secret',
  ...guard,
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply
      .status(200)
      .send(
        await rotateWebhookSecret(
          organizationId,
          userId,
          (req.params as { subscriptionId: WebhookSubscriptionId }).subscriptionId,
        ),
      );
  },
);

const test = makeFastifyRoute(
  RouteMethod.POST,
  '/:subscriptionId/test',
  ...guard,
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const subscriptionId = (req.params as { subscriptionId: WebhookSubscriptionId }).subscriptionId;
    const count = await emitWebhookEvent(
      organizationId,
      userId,
      'contact.updated',
      {
        test: true,
        subscriptionId,
        message: 'Entrega de prueba de Helebba',
      },
      subscriptionId,
    );
    reply.status(202).send({ queued: count });
  },
);

const deliveryList = makeFastifyRoute(
  RouteMethod.GET,
  '/deliveries',
  ...guard,
  async (req, reply) => {
    const query = req.query as { subscriptionId?: WebhookSubscriptionId };
    reply
      .status(200)
      .send(await listWebhookDeliveries(context(req).organizationId, query.subscriptionId));
  },
);

const retryDelivery = makeFastifyRoute(
  RouteMethod.POST,
  '/deliveries/:deliveryId/retry',
  ...guard,
  async (req, reply) => {
    reply.status(200).send({
      delivered: await retryWebhookDelivery(
        context(req).organizationId,
        (req.params as { deliveryId: WebhookDeliveryId }).deliveryId,
      ),
    });
  },
);

export const developerWebhookRoutes: RouteOptions[] = withPrefix('/developers/webhooks', [
  deliveryList,
  retryDelivery,
  eventTypes,
  list,
  create,
  get,
  update,
  remove,
  activeRoute(true),
  activeRoute(false),
  rotateSecret,
  test,
]);
