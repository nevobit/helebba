import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { Warehouse } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';
import {createWarehouse} from '@hlb/business-logic'

export const createWarehouseRoute = makeFastifyRoute(
    RouteMethod.POST,
    '/',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const body = req.body as Partial<Warehouse>;
        const {userId} = req.auth as { userId: string };
        const warehouse = await createWarehouse({...body, tenantId: req.tenant?.tenantId, userId});
        reply.status(201).send(warehouse);
    }
);