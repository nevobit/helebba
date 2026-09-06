import { deleteService } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ServiceId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deleteServiceRoute = makeFastifyRoute(RouteMethod.DELETE, '/:serviceId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { serviceId } = req.params as { serviceId: ServiceId };
  const { userId } = req.auth as unknown as { userId: UserId };
  const item = await deleteService(serviceId, req.organization?.organizationId as OrganizationId, userId);
  reply.status(item ? 200 : 404).send(item ?? { message: 'Servicio no encontrado.' });
});
