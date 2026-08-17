import type { RouteOptions } from 'fastify';
import { createCatalog, deleteCatalog, listCatalogs, updateCatalog } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import { type Catalog, type CatalogId, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const listRoute = makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const query = (req.query ?? {}) as { page?: string; limit?: string; search?: string };
  reply.status(200).send(await listCatalogs({ organizationId: req.organization?.organizationId as OrganizationId, page: Number(query.page ?? 1), limit: Number(query.limit ?? 100), search: query.search ?? '' }));
});

const createRoute = makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { userId } = req.auth as unknown as { userId: UserId };
  const catalog = await createCatalog({ ...(req.body as Partial<Catalog>), organizationId: req.organization?.organizationId as OrganizationId, createdBy: userId, updatedBy: userId });
  reply.status(201).send(catalog);
});

const updateRoute = makeFastifyRoute(RouteMethod.PATCH, '/:catalogId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { catalogId } = req.params as { catalogId: CatalogId };
  const { userId } = req.auth as unknown as { userId: UserId };
  reply.status(200).send(await updateCatalog(catalogId, req.organization?.organizationId as OrganizationId, { ...(req.body as Partial<Catalog>), updatedBy: userId }));
});

const deleteRoute = makeFastifyRoute(RouteMethod.DELETE, '/:catalogId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { catalogId } = req.params as { catalogId: CatalogId };
  const { userId } = req.auth as unknown as { userId: UserId };
  reply.status(200).send(await deleteCatalog(catalogId, req.organization?.organizationId as OrganizationId, userId));
});

export const catalogRoutes: RouteOptions[] = withPrefix('/catalogs', [listRoute, createRoute, updateRoute, deleteRoute]);
