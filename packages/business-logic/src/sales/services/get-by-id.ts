import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, ServiceSchemaMongo, type OrganizationId, type Service, type ServiceId } from '@hlb/contracts';

export const getServiceById = async (serviceId: ServiceId, organizationId: OrganizationId) =>
  getModel<Service>(Collection.SERVICES, ServiceSchemaMongo).findOne({
    _id: serviceId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
