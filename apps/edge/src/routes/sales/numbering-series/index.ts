import type { RouteOptions } from 'fastify';
import {
  createNumberingSeries,
  deleteNumberingSeries,
  getNumberingSeries,
  listNumberingSeries,
  updateNumberingSeries,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type {
  NumberingSeries,
  NumberingSeriesId,
  OrganizationId,
  UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: any) => ({
  organizationId: req.organization.organizationId as OrganizationId,
  userId: req.auth.userId as UserId,
});

const routes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    reply.send(await listNumberingSeries({ ...(req.query as any), organizationId: context(req).organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createNumberingSeries({ ...(req.body as Partial<NumberingSeries>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:seriesId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    reply.send(await getNumberingSeries((req.params as any).seriesId as NumberingSeriesId, context(req).organizationId));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:seriesId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updateNumberingSeries((req.params as any).seriesId as NumberingSeriesId, organizationId, { ...(req.body as Partial<NumberingSeries>), updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:seriesId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await deleteNumberingSeries((req.params as any).seriesId as NumberingSeriesId, organizationId, userId));
  }),
];

export const numberingSeriesRoutes = withPrefix('/numbering-series', routes);
