import { getProductById, listInventoryStock, updateProduct } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { OrganizationId, ProductId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const policies = { organization: 'required', auth: 'required' } as const;
const context = (req: any) => ({
  organizationId: req.organization.organizationId as OrganizationId,
  productId: (req.params as { productId: ProductId }).productId,
  userId: req.auth.userId as UserId,
});

const imageList = (images: string[] = []) =>
  images.map((url, index) => ({ id: String(index), url, main: index === 0 }));

const getProduct = async (req: any) => {
  const { organizationId, productId } = context(req);
  const product = await getProductById(productId, organizationId);
  if (!product) throw new Error('Producto no encontrado.');
  return product;
};

export const productCompatibilityRoutes = [
  makeFastifyRoute(RouteMethod.GET, '/:productId/images', verifyJwt, policies, async (req, reply) => {
    const product = await getProduct(req);
    reply.send(imageList(product.images));
  }),
  makeFastifyRoute(RouteMethod.POST, '/:productId/images', verifyJwt, policies, async (req, reply) => {
    const product = await getProduct(req);
    const { url, imageUrl } = req.body as { url?: string; imageUrl?: string };
    const nextUrl = String(url ?? imageUrl ?? '').trim();
    if (!nextUrl) return reply.status(400).send({ message: 'La URL de la imagen es obligatoria.' });
    const images = [...new Set([...(product.images ?? []), nextUrl])];
    const { organizationId, productId, userId } = context(req);
    await updateProduct(productId, organizationId, { images, updatedBy: userId });
    reply.status(201).send(imageList(images).find((image) => image.url === nextUrl));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:productId/images/:imageId', verifyJwt, policies, async (req, reply) => {
    const product = await getProduct(req);
    const image = imageList(product.images).find(({ id }) => id === (req.params as any).imageId);
    if (!image) return reply.status(404).send({ message: 'Imagen no encontrada.' });
    reply.send(image);
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:productId/images/:imageId/main', verifyJwt, policies, async (req, reply) => {
    const product = await getProduct(req);
    const imageIndex = Number((req.params as any).imageId);
    const images = [...(product.images ?? [])];
    if (!Number.isInteger(imageIndex) || !images[imageIndex]) return reply.status(404).send({ message: 'Imagen no encontrada.' });
    const [mainImage] = images.splice(imageIndex, 1);
    images.unshift(mainImage);
    const { organizationId, productId, userId } = context(req);
    await updateProduct(productId, organizationId, { images, updatedBy: userId });
    reply.send(imageList(images));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:productId/images/:imageId', verifyJwt, policies, async (req, reply) => {
    const product = await getProduct(req);
    const imageIndex = Number((req.params as any).imageId);
    const images = [...(product.images ?? [])];
    if (!Number.isInteger(imageIndex) || !images[imageIndex]) return reply.status(404).send({ message: 'Imagen no encontrada.' });
    images.splice(imageIndex, 1);
    const { organizationId, productId, userId } = context(req);
    await updateProduct(productId, organizationId, { images, updatedBy: userId });
    reply.send({ id: String(imageIndex), deleted: true });
  }),
  makeFastifyRoute(RouteMethod.GET, '/:productId/stock', verifyJwt, policies, async (req, reply) => {
    const { organizationId, productId } = context(req);
    await getProduct(req);
    const entries = (await listInventoryStock(organizationId)).filter((entry) => String(entry.productId) === String(productId));
    reply.send({
      productId,
      quantity: entries.reduce((sum, entry) => sum + Number(entry.quantity ?? 0), 0),
      reservedQuantity: entries.reduce((sum, entry) => sum + Number(entry.reservedQuantity ?? 0), 0),
      inTransitQuantity: entries.reduce((sum, entry) => sum + Number(entry.inTransitQuantity ?? 0), 0),
      warehouses: entries,
    });
  }),
  makeFastifyRoute(RouteMethod.GET, '/:productId/stock/transit', verifyJwt, policies, async (req, reply) => {
    const { organizationId, productId } = context(req);
    await getProduct(req);
    const entries = (await listInventoryStock(organizationId)).filter(
      (entry) => String(entry.productId) === String(productId) && Number(entry.inTransitQuantity ?? 0) > 0,
    );
    reply.send({ productId, quantity: entries.reduce((sum, entry) => sum + Number(entry.inTransitQuantity ?? 0), 0), warehouses: entries });
  }),
];
