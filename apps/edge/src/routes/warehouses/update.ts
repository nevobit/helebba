import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { verifyAccessToken } from '@hlb/security';

export const updateWarehouseRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:',
  verifyAccessToken,
  { tenant: 'required', auth: 'required' },
  async (req, reply) => {},
);
