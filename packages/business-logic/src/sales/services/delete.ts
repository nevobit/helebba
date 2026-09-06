import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, ServiceSchemaMongo, type OrganizationId, type Service, type ServiceId, type UserId } from '@hlb/contracts';

export const deleteService = async (serviceId: ServiceId, organizationId: OrganizationId, deletedBy: UserId) =>
  getModel<Service>(Collection.SERVICES, ServiceSchemaMongo).findOneAndUpdate(
    { _id: serviceId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    { $set: { lifecycleStatus: LifecycleStatus.DELETED, deletedAt: new Date(), deletedBy, updatedBy: deletedBy } },
    { new: true },
  );
