import type { RouteOptions } from 'fastify';
import {
  cancelProductionOrder,
  cancelStockTransfer,
  completeProductionOrder,
  createInventoryLot,
  createProductionOrder,
  createStockTransfer,
  deleteProductionOrder,
  getProductionOrder,
  getStockTransfer,
  listInventoryLots,
  listInventoryStock,
  listProductionOrders,
  listStockTransfers,
  receiveStockTransfer,
  shipStockTransfer,
  startProductionOrder,
  updateProductionOrder,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { OrganizationId, ProductionOrderId, StockTransferId, UserId, WarehouseId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const options = { organization: 'required', auth: 'required' } as const;
const scope = (req: any) => ({
  organizationId: req.organization.organizationId as OrganizationId,
  userId: req.auth.userId as UserId,
});

const inventoryStockRoute = makeFastifyRoute(RouteMethod.GET, '/stock', verifyJwt, options, async (req, reply) => {
  const query = req.query as { warehouseId?: WarehouseId };
  reply.send(await listInventoryStock(scope(req).organizationId, query.warehouseId));
});
const inventoryLotsListRoute = makeFastifyRoute(RouteMethod.GET, '/lots', verifyJwt, options, async (req, reply) => {
  reply.send(await listInventoryLots(scope(req).organizationId, req.query as { productId?: string; warehouseId?: string }));
});
const inventoryLotsCreateRoute = makeFastifyRoute(RouteMethod.POST, '/lots', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.status(201).send(await createInventoryLot(organizationId, userId, req.body as any));
});
const transferListRoute = makeFastifyRoute(RouteMethod.GET, '/transfers', verifyJwt, options, async (req, reply) => {
  reply.send(await listStockTransfers(scope(req).organizationId));
});
const transferCreateRoute = makeFastifyRoute(RouteMethod.POST, '/transfers', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.status(201).send(await createStockTransfer(organizationId, userId, req.body as any));
});
const transferGetRoute = makeFastifyRoute(RouteMethod.GET, '/transfers/:transferId', verifyJwt, options, async (req, reply) => {
  const transfer = await getStockTransfer(scope(req).organizationId, (req.params as any).transferId as StockTransferId);
  if (!transfer) return reply.status(404).send({ message: 'Transferencia no encontrada.' });
  reply.send(transfer);
});
const transferShipRoute = makeFastifyRoute(RouteMethod.POST, '/transfers/:transferId/ship', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.send(await shipStockTransfer(organizationId, userId, (req.params as any).transferId as StockTransferId));
});
const transferReceiveRoute = makeFastifyRoute(RouteMethod.POST, '/transfers/:transferId/receive', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.send(await receiveStockTransfer(organizationId, userId, (req.params as any).transferId as StockTransferId));
});
const transferCancelRoute = makeFastifyRoute(RouteMethod.POST, '/transfers/:transferId/cancel', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.send(await cancelStockTransfer(organizationId, userId, (req.params as any).transferId as StockTransferId));
});
const productionListRoute = makeFastifyRoute(RouteMethod.GET, '/production-orders', verifyJwt, options, async (req, reply) => {
  reply.send(await listProductionOrders(scope(req).organizationId));
});
const productionCreateRoute = makeFastifyRoute(RouteMethod.POST, '/production-orders', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.status(201).send(await createProductionOrder(organizationId, userId, req.body as any));
});
const productionGetRoute = makeFastifyRoute(RouteMethod.GET, '/production-orders/:productionOrderId', verifyJwt, options, async (req, reply) => {
  const order = await getProductionOrder(scope(req).organizationId, (req.params as any).productionOrderId as ProductionOrderId);
  if (!order) return reply.status(404).send({ message: 'Orden de producción no encontrada.' });
  reply.send(order);
});
const productionUpdateRoute = makeFastifyRoute(RouteMethod.PATCH, '/production-orders/:productionOrderId', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.send(await updateProductionOrder(organizationId, userId, (req.params as any).productionOrderId as ProductionOrderId, req.body as any));
});
const productionDeleteRoute = makeFastifyRoute(RouteMethod.DELETE, '/production-orders/:productionOrderId', verifyJwt, options, async (req, reply) => {
  reply.send(await deleteProductionOrder(scope(req).organizationId, (req.params as any).productionOrderId as ProductionOrderId));
});
const productionStartRoute = makeFastifyRoute(RouteMethod.POST, '/production-orders/:productionOrderId/start', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.send(await startProductionOrder(organizationId, userId, (req.params as any).productionOrderId as ProductionOrderId));
});
const productionCompleteRoute = makeFastifyRoute(RouteMethod.POST, '/production-orders/:productionOrderId/complete', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.send(await completeProductionOrder(organizationId, userId, (req.params as any).productionOrderId as ProductionOrderId));
});
const productionCancelRoute = makeFastifyRoute(RouteMethod.POST, '/production-orders/:productionOrderId/cancel', verifyJwt, options, async (req, reply) => {
  const { organizationId, userId } = scope(req);
  reply.send(await cancelProductionOrder(organizationId, userId, (req.params as any).productionOrderId as ProductionOrderId));
});

export const inventoryOperationRoutes: RouteOptions[] = withPrefix('/inventory', [
  inventoryStockRoute,
  inventoryLotsListRoute,
  inventoryLotsCreateRoute,
  transferListRoute,
  transferCreateRoute,
  transferGetRoute,
  transferShipRoute,
  transferReceiveRoute,
  transferCancelRoute,
  productionListRoute,
  productionCreateRoute,
  productionGetRoute,
  productionUpdateRoute,
  productionDeleteRoute,
  productionStartRoute,
  productionCompleteRoute,
  productionCancelRoute,
]);
