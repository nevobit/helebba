import type { RouteOptions } from 'fastify';
import {
  getAllBrands,
  getAllCategories,
  getAllProducts,
  getProductById,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductId } from '@hlb/contracts';
import { requireSdkApiKey } from './auth';

type ListQuery = {
  page?: string;
  limit?: string;
  search?: string;
};

const toPositiveInteger = (value: string | undefined, fallback: number, max: number) => {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
};

const listParams = (query: ListQuery, organizationId: string) => ({
  organizationId: organizationId as OrganizationId,
  page: toPositiveInteger(query.page, 1, 10_000),
  limit: toPositiveInteger(query.limit, 100, 250),
  search: query.search ?? '',
});

const listProductsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/products',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const sdk = await requireSdkApiKey(req, reply, 'inventory:read');
    if (!sdk) return;

    const query = (req.query ?? {}) as ListQuery;
    const products = await getAllProducts(listParams(query, sdk.organizationId));

    return reply.status(200).send(products);
  },
);

const getProductRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/products/:productId',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const sdk = await requireSdkApiKey(req, reply, 'inventory:read');
    if (!sdk) return;

    const { productId } = req.params as { productId: ProductId };
    const product = await getProductById(productId);

    if (!product || product.organizationId !== sdk.organizationId) {
      return reply.status(404).send({ error: 'not_found', message: 'Product not found' });
    }

    return reply.status(200).send(product);
  },
);

const listBrandsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/brands',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const sdk = await requireSdkApiKey(req, reply, 'inventory:read');
    if (!sdk) return;

    const query = (req.query ?? {}) as ListQuery;
    const brands = await getAllBrands(listParams(query, sdk.organizationId));

    return reply.status(200).send(brands);
  },
);

const listCategoriesRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/categories',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const sdk = await requireSdkApiKey(req, reply, 'inventory:read');
    if (!sdk) return;

    const query = (req.query ?? {}) as ListQuery;
    const categories = await getAllCategories(listParams(query, sdk.organizationId));

    return reply.status(200).send(categories);
  },
);

export const sdkRoutes: RouteOptions[] = withPrefix('/sdk', [
  listProductsRoute,
  getProductRoute,
  listBrandsRoute,
  listCategoriesRoute,
]);
