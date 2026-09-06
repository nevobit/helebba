import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, ServiceSchemaMongo, type OrganizationId, type Service, type ServiceId, type UserId } from '@hlb/contracts';

export const updateService = async (
  serviceId: ServiceId,
  organizationId: OrganizationId,
  updatedBy: UserId,
  data: Partial<Service>,
) => {
  const { id: _id, organizationId: _organizationId, createdBy: _createdBy, ...changes } = data;
  return getModel<Service>(Collection.SERVICES, ServiceSchemaMongo).findOneAndUpdate(
    { _id: serviceId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    { $set: { ...changes, updatedBy } },
    { new: true, runValidators: true },
  );
};
