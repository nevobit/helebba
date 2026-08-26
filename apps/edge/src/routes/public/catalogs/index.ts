import { createCatalogOrder, getPublicCatalog } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { RouteOptions } from 'fastify';

const getCatalogRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:publicId',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const { publicId } = req.params as { publicId: string };
    const catalog = await getPublicCatalog(publicId);
    if (!catalog) {
      reply.status(404).send({ message: 'Catálogo no encontrado.' });
      return;
    }
    reply.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    reply.status(200).send(catalog);
  },
);

const createOrderRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/:publicId/orders',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const { publicId } = req.params as { publicId: string };
    const body = (req.body ?? {}) as Parameters<typeof createCatalogOrder>[0];
    try {
      const order = await createCatalogOrder({
        publicId,
        customer: body.customer,
        items: body.items,
      });
      reply.status(201).send({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        currency: order.currency,
        total: order.total,
      });
    } catch (error) {
      const code = error instanceof Error ? error.message : 'INVALID_ORDER';
      const status = code === 'CATALOG_NOT_FOUND' ? 404 : code === 'INSUFFICIENT_STOCK' ? 409 : 400;
      const messages: Record<string, string> = {
        CATALOG_NOT_FOUND: 'Catálogo no encontrado.',
        INVALID_CUSTOMER: 'Completa el nombre y un correo válido.',
        INVALID_ORDER_LINES: 'Añade al menos un producto al pedido.',
        PRODUCT_NOT_AVAILABLE: 'Uno de los productos ya no está disponible.',
        VARIANT_NOT_AVAILABLE: 'Una de las variantes ya no está disponible.',
        INVALID_QUANTITY: 'La cantidad indicada no es válida.',
        INSUFFICIENT_STOCK: 'No hay stock suficiente para completar el pedido.',
      };
      reply.status(status).send({ message: messages[code] ?? 'No pudimos crear el pedido.', code });
    }
  },
);

export const publicCatalogRoutes: RouteOptions[] = withPrefix('/public/catalogs', [
  getCatalogRoute,
  createOrderRoute,
]);
