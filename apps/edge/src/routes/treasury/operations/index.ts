import {
  createBillingForecast,
  createRemittance,
  deleteBillingForecast,
  getBillingForecast,
  getRemittance,
  listBillingForecasts,
  listRemittances,
  updateBillingForecast,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type {
  BillingForecast,
  BillingForecastId,
  OrganizationId,
  Remittance,
  RemittanceId,
  UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import type { RouteOptions } from 'fastify';

const organizationId = (req: { organization?: { organizationId?: unknown } }) =>
  req.organization?.organizationId as OrganizationId;
const userId = (req: { auth?: unknown }) => (req.auth as { userId: UserId }).userId;
const guard = [verifyJwt, { organization: 'required', auth: 'required' }] as const;

const remittanceRoutes = withPrefix('/treasury/remittances', [
  makeFastifyRoute(RouteMethod.GET, '/', ...guard, async (req, reply) => {
    reply.status(200).send(await listRemittances(organizationId(req)));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', ...guard, async (req, reply) => {
    const actor = userId(req);
    reply.status(201).send(
      await createRemittance({
        ...(req.body as Partial<Remittance>),
        organizationId: organizationId(req),
        createdBy: actor,
        updatedBy: actor,
      }),
    );
  }),
  makeFastifyRoute(RouteMethod.GET, '/:id', ...guard, async (req, reply) => {
    const item = await getRemittance(
      (req.params as { id: RemittanceId }).id,
      organizationId(req),
    );
    reply.status(item ? 200 : 404).send(item ?? { message: 'Remittance not found' });
  }),
]);

const forecastRoutes = withPrefix('/treasury/billing-forecasts', [
  makeFastifyRoute(RouteMethod.GET, '/', ...guard, async (req, reply) => {
    reply.status(200).send(await listBillingForecasts(organizationId(req)));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', ...guard, async (req, reply) => {
    const actor = userId(req);
    reply.status(201).send(
      await createBillingForecast({
        ...(req.body as Partial<BillingForecast>),
        organizationId: organizationId(req),
        createdBy: actor,
        updatedBy: actor,
      }),
    );
  }),
  makeFastifyRoute(RouteMethod.GET, '/:id', ...guard, async (req, reply) => {
    const item = await getBillingForecast(
      (req.params as { id: BillingForecastId }).id,
      organizationId(req),
    );
    reply.status(item ? 200 : 404).send(item ?? { message: 'Billing forecast not found' });
  }),
  makeFastifyRoute(RouteMethod.PUT, '/:id', ...guard, async (req, reply) => {
    const item = await updateBillingForecast(
      (req.params as { id: BillingForecastId }).id,
      organizationId(req),
      userId(req),
      req.body as Partial<BillingForecast>,
    );
    reply.status(item ? 200 : 404).send(item ?? { message: 'Billing forecast not found' });
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:id', ...guard, async (req, reply) => {
    const item = await deleteBillingForecast(
      (req.params as { id: BillingForecastId }).id,
      organizationId(req),
      userId(req),
    );
    reply.status(item ? 200 : 404).send(item ?? { message: 'Billing forecast not found' });
  }),
]);

export const treasuryOperationRoutes: RouteOptions[] = [...remittanceRoutes, ...forecastRoutes];
