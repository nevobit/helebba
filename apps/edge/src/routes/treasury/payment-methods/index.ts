import {
  createPaymentMethod,
  deletePaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import {
  type OrganizationId,
  type PaymentMethod,
  type PaymentMethodId,
  type UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import type { RouteOptions } from 'fastify';

type PaymentMethodListQuery = {
  page?: string;
  limit?: string;
  search?: string;
};

const listPaymentMethodsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const query = (req.query ?? {}) as PaymentMethodListQuery;
    const { userId } = req.auth as unknown as { userId: UserId };
    const paymentMethods = await getAllPaymentMethods({
      organizationId: req.organization?.organizationId as OrganizationId,
      userId,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 100),
      search: query.search ?? '',
    });

    reply.status(200).send(paymentMethods);
  },
);

const createPaymentMethodRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = req.body as Partial<PaymentMethod>;
    const { userId } = req.auth as unknown as { userId: UserId };
    const paymentMethod = await createPaymentMethod({
      ...body,
      organizationId: req.organization?.organizationId as OrganizationId,
      createdBy: userId,
      updatedBy: userId,
    });

    reply.status(201).send(paymentMethod);
  },
);

const getPaymentMethodRoute = makeFastifyRoute(RouteMethod.GET, '/:paymentMethodId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { paymentMethodId } = req.params as { paymentMethodId: PaymentMethodId };
  const item = await getPaymentMethodById(paymentMethodId, req.organization?.organizationId as OrganizationId);
  reply.status(item ? 200 : 404).send(item ?? { message: 'Método de pago no encontrado.' });
});

const updatePaymentMethodRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:paymentMethodId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = req.body as Partial<PaymentMethod>;
    const { paymentMethodId } = req.params as { paymentMethodId: PaymentMethodId };
    const { userId } = req.auth as unknown as { userId: UserId };
    const paymentMethod = await updatePaymentMethod(paymentMethodId, {
      ...body,
      organizationId: req.organization?.organizationId as OrganizationId,
      updatedBy: userId,
    });

    reply
      .status(paymentMethod ? 200 : 404)
      .send(paymentMethod ?? { message: 'Payment method not found' });
  },
);

const deletePaymentMethodRoute = makeFastifyRoute(RouteMethod.DELETE, '/:paymentMethodId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { paymentMethodId } = req.params as { paymentMethodId: PaymentMethodId };
  const { userId } = req.auth as unknown as { userId: UserId };
  const item = await deletePaymentMethod(paymentMethodId, req.organization?.organizationId as OrganizationId, userId);
  reply.status(item ? 200 : 404).send(item ?? { message: 'Método de pago no encontrado.' });
});

export const paymentMethodRoutes: RouteOptions[] = withPrefix('/payment-methods', [
  listPaymentMethodsRoute,
  createPaymentMethodRoute,
  getPaymentMethodRoute,
  updatePaymentMethodRoute,
  deletePaymentMethodRoute,
]);
