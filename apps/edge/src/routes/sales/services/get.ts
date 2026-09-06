import { getServiceById } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ServiceId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getServiceRoute = makeFastifyRoute(RouteMethod.GET, '/:serviceId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
  const { serviceId } = req.params as { serviceId: ServiceId };
  const item = await getServiceById(serviceId, req.organization?.organizationId as OrganizationId);
  reply.status(item ? 200 : 404).send(item ?? { message: 'Servicio no encontrado.' });
});
