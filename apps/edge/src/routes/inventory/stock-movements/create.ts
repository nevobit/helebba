import { createStockMovement } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import {
  type OrganizationId,
  type ProductId,
  type StockMovementType,
  type UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const MOVEMENT_TYPES: StockMovementType[] = ['in', 'out', 'adjustment'];

export const createStockMovementRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/:productId/stock-movements',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId } = req.params as { productId: ProductId };
    const body = (req.body ?? {}) as {
      type?: StockMovementType;
      quantity?: number;
      reason?: string;
      variantId?: string;
    };
    if (!body.type || !MOVEMENT_TYPES.includes(body.type)) {
      return reply.status(400).send({ message: 'El tipo de movimiento no es válido.' });
    }
    if (typeof body.quantity !== 'number' || !Number.isFinite(body.quantity) || body.quantity <= 0) {
      return reply.status(400).send({ message: 'La cantidad debe ser un número mayor que cero.' });
    }
    const { userId } = req.auth as unknown as { userId: UserId };
    const movement = await createStockMovement({
      productId,
      organizationId: req.organization?.organizationId as OrganizationId,
      type: body.type,
      quantity: body.quantity,
      reason: body.reason ?? '',
      variantId: body.variantId,
      createdBy: userId,
    });
    reply.status(201).send(movement);
  },
);