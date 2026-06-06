import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { verifyJwt } from '@hlb/security';
import { OrganizationId, Product, UserId } from '@hlb/contracts';
import { createProduct } from '@hlb/business-logic';

export const createProductRoute = makeFastifyRoute(
  RouteMethod.POST, //Metodo HTTP
  '/', //Ruta
  verifyJwt, //Verifica que el usuario este authenticado
  { organization: 'required', auth: 'required' }, //Validación de tenant y autenticación
  async (req, reply) => {
    const body = req.body as Partial<Product>;
    const { userId } = req.auth as unknown as { userId: UserId };

    const product = await createProduct({
      ...body,
      organizationId: req.organization?.organizationId as OrganizationId,
      createdBy: userId,
    });
    reply.status(201).send(product);
  },
);
