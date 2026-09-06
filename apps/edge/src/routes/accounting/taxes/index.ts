import type { RouteOptions } from 'fastify';
import { createTax, deleteTax, getTax, listTaxes, updateTax } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { OrganizationId, Tax, TaxId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: any) => ({ organizationId: req.organization.organizationId as OrganizationId, userId: req.auth.userId as UserId });

const routes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    reply.send(await listTaxes({ ...(req.query as any), organizationId: context(req).organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createTax({ ...(req.body as Partial<Tax>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:taxId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    reply.send(await getTax((req.params as any).taxId as TaxId, context(req).organizationId));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:taxId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updateTax((req.params as any).taxId as TaxId, organizationId, { ...(req.body as Partial<Tax>), updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:taxId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await deleteTax((req.params as any).taxId as TaxId, organizationId, userId));
  }),
];

export const taxRoutes = withPrefix('/taxes', routes);
