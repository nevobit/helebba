import { getInventoryAnalytics } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getInventoryAnalyticsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/inventory-analytics',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (request, reply) => {
    const query = (request.query ?? {}) as Record<string, string | undefined>;
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = query.startDate ? new Date(query.startDate) : new Date(endDate);
    if (!query.startDate) startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate)
      throw new Error('El rango de fechas no es válido.');
    reply.status(200).send(await getInventoryAnalytics({
      organizationId: request.organization!.organizationId as OrganizationId,
      startDate,
      endDate,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 10),
      search: query.search ?? '',
    }));
  },
);
