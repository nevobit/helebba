import { createWarehouse } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type UserId, type Warehouse } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const createWarehouseRoute = makeFastifyRoute(
    RouteMethod.POST,
    '/',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const body = req.body as Partial<Warehouse>;
      const { userId } = req.auth as unknown as { userId: UserId };
      const warehouse = await createWarehouse({
        ...body,
        organizationId: req.organization?.organizationId as OrganizationId,
        userId,
        createdBy: userId,
        updatedBy: userId,
      });

      reply.status(201).send(warehouse);
    }
);
