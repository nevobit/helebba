import { updateProductFieldDefinition } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type {
  OrganizationId,
  ProductFieldDefinition,
  ProductFieldDefinitionId,
  UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateProductFieldDefinitionRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:definitionId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { definitionId } = req.params as { definitionId: ProductFieldDefinitionId };
    const { userId } = req.auth as unknown as { userId: UserId };
    const definition = await updateProductFieldDefinition(
      definitionId,
      req.organization?.organizationId as OrganizationId,
      { ...(req.body as Partial<ProductFieldDefinition>), updatedBy: userId },
    );

    if (!definition) return reply.status(404).send({ message: 'Campo no encontrado.' });
    return reply.status(200).send(definition);
  },
);
