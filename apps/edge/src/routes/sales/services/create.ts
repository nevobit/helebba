import { createService } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type Service, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const createServiceRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = req.body as Partial<Service>;
    const { userId } = req.auth as unknown as { userId: UserId };
    const service = await createService({
      ...body,
      organizationId: req.organization?.organizationId as OrganizationId,
      createdBy: userId,
      updatedBy: userId,
    });

    reply.status(201).send(service);
  },
);
