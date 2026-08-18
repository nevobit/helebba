import type { RouteOptions } from 'fastify';
import {
  addPosRegister,
  closePosSession,
  createPosSale,
  createPosStore,
  deletePosStore,
  getPosStore,
  listPosReceipts,
  listPosStores,
  openPosSession,
  type PosSaleInput,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import {
  type OrganizationId,
  type PosCashRegister,
  type PosRegisterId,
  type PosStore,
  type PosStoreId,
  type UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const list = makeFastifyRoute(
  RouteMethod.GET,
  '/stores',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const query = (req.query ?? {}) as { page?: string; limit?: string; search?: string };
    reply
      .status(200)
      .send(
        await listPosStores({
          organizationId: req.organization?.organizationId as OrganizationId,
          page: Number(query.page ?? 1),
          limit: Number(query.limit ?? 100),
          search: query.search ?? '',
        }),
      );
  },
);
const create = makeFastifyRoute(
  RouteMethod.POST,
  '/stores',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { userId } = req.auth as unknown as { userId: UserId };
    reply
      .status(201)
      .send(
        await createPosStore({
          ...(req.body as Partial<PosStore>),
          organizationId: req.organization?.organizationId as OrganizationId,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
  },
);
const get = makeFastifyRoute(
  RouteMethod.GET,
  '/stores/:storeId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { storeId } = req.params as { storeId: PosStoreId };
    const store = await getPosStore(storeId, req.organization?.organizationId as OrganizationId);
    if (!store) return void reply.status(404).send({ message: 'Tienda no encontrada.' });
    reply.status(200).send(store);
  },
);
const addRegister = makeFastifyRoute(
  RouteMethod.POST,
  '/stores/:storeId/registers',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { storeId } = req.params as { storeId: PosStoreId };
    reply
      .status(201)
      .send(
        await addPosRegister(
          storeId,
          req.organization?.organizationId as OrganizationId,
          req.body as Partial<PosCashRegister>,
        ),
      );
  },
);
const remove = makeFastifyRoute(
  RouteMethod.DELETE,
  '/stores/:storeId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { storeId } = req.params as { storeId: PosStoreId };
    const { userId } = req.auth as unknown as { userId: UserId };
    reply
      .status(200)
      .send(
        await deletePosStore(storeId, req.organization?.organizationId as OrganizationId, userId),
      );
  },
);
const openSession = makeFastifyRoute(
  RouteMethod.POST,
  '/stores/:storeId/registers/:registerId/open',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { storeId, registerId } = req.params as {
      storeId: PosStoreId;
      registerId: PosRegisterId;
    };
    const { userId } = req.auth as unknown as { userId: UserId };
    const { openingBalance = 0 } = req.body as { openingBalance?: number };
    reply
      .status(201)
      .send(
        await openPosSession(
          storeId,
          registerId,
          req.organization?.organizationId as OrganizationId,
          userId,
          Number(openingBalance),
        ),
      );
  },
);
const closeSession = makeFastifyRoute(
  RouteMethod.POST,
  '/stores/:storeId/registers/:registerId/close',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { storeId, registerId } = req.params as {
      storeId: PosStoreId;
      registerId: PosRegisterId;
    };
    const { userId } = req.auth as unknown as { userId: UserId };
    const { closingBalance = 0 } = req.body as { closingBalance?: number };
    reply
      .status(200)
      .send(
        await closePosSession(
          storeId,
          registerId,
          req.organization?.organizationId as OrganizationId,
          userId,
          Number(closingBalance),
        ),
      );
  },
);
const sale = makeFastifyRoute(
  RouteMethod.POST,
  '/stores/:storeId/registers/:registerId/sales',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { storeId, registerId } = req.params as {
      storeId: PosStoreId;
      registerId: PosRegisterId;
    };
    const { userId } = req.auth as unknown as { userId: UserId };
    reply
      .status(201)
      .send(
        await createPosSale(
          storeId,
          registerId,
          req.organization?.organizationId as OrganizationId,
          userId,
          req.body as PosSaleInput,
        ),
      );
  },
);
const receiptList = makeFastifyRoute(
  RouteMethod.GET,
  '/stores/:storeId/receipts',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { storeId } = req.params as { storeId: PosStoreId };
    reply
      .status(200)
      .send(await listPosReceipts(storeId, req.organization?.organizationId as OrganizationId));
  },
);
export const posRoutes: RouteOptions[] = withPrefix('/pos', [
  list,
  create,
  get,
  addRegister,
  openSession,
  closeSession,
  sale,
  receiptList,
  remove,
]);
