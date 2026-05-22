import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { verifyAccessToken } from '@hlb/security';
import { Product } from '@hlb/contracts';
import { createProduct } from '@hlb/business-logic';

export const createProductRoute = makeFastifyRoute(
  RouteMethod.POST, //Metodo HTTP
  '/', //Ruta
  verifyAccessToken, //Verifica que el usuario este authenticado
  { tenant: 'required', auth: 'required' }, //Validación de tenant y autenticación
  async (req, reply) => {
    const body = req.body as Partial<Product>;
    const { userId } = req.auth as { userId: string };
    const product = await createProduct({ ...body, tenantId: req.tenant?.tenantId, userId });
    reply.status(201).send(product);
  },
);
