import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { verifyJwt } from '@hlb/security';

export const updateWarehouseRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {},
);
