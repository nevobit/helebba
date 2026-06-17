import {
  createPayment,
  getAllPayments,
  getPaymentById,
  softDeletePayment,
  updatePayment,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { OrganizationId, Payment, PaymentId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import type { RouteOptions } from 'fastify';

type PaymentListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
};

export const paymentRoutes: RouteOptions[] = withPrefix('/payments', [
  makeFastifyRoute(
    RouteMethod.GET,
    '/',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const query = (req.query ?? {}) as PaymentListQuery;
      const payments = await getAllPayments({
        organizationId: req.organization?.organizationId as OrganizationId,
        page: Number(query.page ?? 1),
        limit: Number(query.limit ?? 100),
        search: query.search ?? '',
        status: query.status ?? 'all',
      });

      reply.status(200).send(payments);
    },
  ),
  makeFastifyRoute(
    RouteMethod.POST,
    '/',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const body = req.body as Partial<Payment>;
      const { userId } = req.auth as unknown as { userId: UserId };
      const payment = await createPayment({
        ...body,
        organizationId: req.organization?.organizationId as OrganizationId,
        createdBy: userId,
        updatedBy: userId,
      });

      reply.status(201).send(payment);
    },
  ),
  makeFastifyRoute(
    RouteMethod.GET,
    '/:paymentId',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { paymentId } = req.params as { paymentId: PaymentId };
      const payment = await getPaymentById(
        paymentId,
        req.organization?.organizationId as OrganizationId,
      );

      reply.status(payment ? 200 : 404).send(payment ?? { message: 'Payment not found' });
    },
  ),
  makeFastifyRoute(
    RouteMethod.PATCH,
    '/:paymentId',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const body = req.body as Partial<Payment>;
      const { paymentId } = req.params as { paymentId: PaymentId };
      const { userId } = req.auth as unknown as { userId: UserId };
      const payment = await updatePayment(paymentId, {
        ...body,
        updatedBy: userId,
      });

      reply.status(payment ? 200 : 404).send(payment ?? { message: 'Payment not found' });
    },
  ),
  makeFastifyRoute(
    RouteMethod.DELETE,
    '/:paymentId',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { paymentId } = req.params as { paymentId: PaymentId };
      const payment = await softDeletePayment(paymentId);

      reply.status(payment ? 200 : 404).send(payment ?? { message: 'Payment not found' });
    },
  ),
]);
