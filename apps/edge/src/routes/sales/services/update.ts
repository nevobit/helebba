import { updateService } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type Service, type ServiceId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateServiceRoute = makeFastifyRoute(RouteMethod.PATCH, '/:serviceId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { serviceId } = req.params as { serviceId: ServiceId };
  const { userId } = req.auth as unknown as { userId: UserId };
  const item = await updateService(serviceId, req.organization?.organizationId as OrganizationId, userId, (req.body ?? {}) as Partial<Service>);
  reply.status(item ? 200 : 404).send(item ?? { message: 'Servicio no encontrado.' });
});
