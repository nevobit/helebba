import { createProductFieldDefinition } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { OrganizationId, ProductFieldDefinition, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const createProductFieldDefinitionRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    try {
      const body = req.body as Partial<ProductFieldDefinition>;
      const { userId } = req.auth as unknown as { userId: UserId };
      const definition = await createProductFieldDefinition({
        ...body,
        organizationId: req.organization?.organizationId as OrganizationId,
        createdBy: userId,
        updatedBy: userId,
      });

      return reply.status(201).send(definition);
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : 'No pudimos crear el campo.',
      });
    }
  },
);
