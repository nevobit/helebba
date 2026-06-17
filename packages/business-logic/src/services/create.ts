import { Collection, getModel } from '@hlb/constant-definitions';
import { ServiceSchemaMongo, type Service } from '@hlb/contracts';

export const createService = async (data: Partial<Service>): Promise<Service> => {
  const model = getModel<Service>(Collection.SERVICES, ServiceSchemaMongo);
  const service = new model(data);
  const createdService = await service.save();

  return createdService;
};
