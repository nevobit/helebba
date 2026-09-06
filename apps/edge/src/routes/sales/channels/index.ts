import type { RouteOptions } from 'fastify';
import { createSalesChannel, deleteSalesChannel, getSalesChannel, listSalesChannels, updateSalesChannel } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { OrganizationId, SalesChannel, SalesChannelId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: any) => ({ organizationId: req.organization.organizationId as OrganizationId, userId: req.auth.userId as UserId });

const routes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await listSalesChannels({ ...(req.query as any), organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createSalesChannel({ ...(req.body as Partial<SalesChannel>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:salesChannelId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await getSalesChannel((req.params as any).salesChannelId as SalesChannelId, organizationId));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:salesChannelId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updateSalesChannel((req.params as any).salesChannelId as SalesChannelId, organizationId, { ...(req.body as Partial<SalesChannel>), updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:salesChannelId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await deleteSalesChannel((req.params as any).salesChannelId as SalesChannelId, organizationId, userId));
  }),
];

export const salesChannelRoutes = withPrefix('/sales-channels', routes);
