import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  SalesChannelSchemaMongo,
  type OrganizationId,
  type SalesChannel,
  type SalesChannelId,
  type UserId,
} from '@hlb/contracts';

const channels = () =>
  getModel<SalesChannel>(Collection.SALES_CHANNELS, SalesChannelSchemaMongo);

type ChannelQuery = {
  organizationId: OrganizationId;
  search?: string;
  active?: boolean | string;
  type?: string;
};

export const listSalesChannels = async ({ organizationId, search, active, type }: ChannelQuery) => {
  const query: Record<string, unknown> = {
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  };
  if (search?.trim()) query.name = { $regex: search.trim(), $options: 'i' };
  if (active !== undefined) query.active = active === true || active === 'true';
  if (type) query.type = type;
  return channels().find(query).sort({ isDefault: -1, name: 1 });
};

export const createSalesChannel = async (data: Partial<SalesChannel>) => {
  const name = data.name?.trim();
  if (!name) throw new Error('Ingresa el nombre del canal de venta.');
  if (!data.organizationId) throw new Error('La organización es obligatoria.');
  if (data.isDefault) {
    await channels().updateMany(
      { organizationId: data.organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
      { $set: { isDefault: false } },
    );
  }
  return channels().create({ ...data, name });
};

export const getSalesChannel = async (
  salesChannelId: SalesChannelId,
  organizationId: OrganizationId,
) => {
  const channel = await channels().findOne({
    _id: salesChannelId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!channel) throw new Error('El canal de venta no existe.');
  return channel;
};

export const updateSalesChannel = async (
  salesChannelId: SalesChannelId,
  organizationId: OrganizationId,
  data: Partial<SalesChannel>,
) => {
  const current = await getSalesChannel(salesChannelId, organizationId);
  const name = data.name === undefined ? current.name : data.name.trim();
  if (!name) throw new Error('Ingresa el nombre del canal de venta.');
  if (data.isDefault) {
    await channels().updateMany(
      {
        _id: { $ne: salesChannelId },
        organizationId,
        lifecycleStatus: { $ne: LifecycleStatus.DELETED },
      },
      { $set: { isDefault: false } },
    );
  }
  const updated = await channels().findOneAndUpdate(
    { _id: salesChannelId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    { $set: { ...data, name } },
    { new: true, runValidators: true },
  );
  if (!updated) throw new Error('No pudimos actualizar el canal de venta.');
  return updated;
};

export const deleteSalesChannel = async (
  salesChannelId: SalesChannelId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const channel = await getSalesChannel(salesChannelId, organizationId);
  if (channel.isDefault) throw new Error('No puedes eliminar el canal de venta predeterminado.');
  channel.lifecycleStatus = LifecycleStatus.DELETED;
  channel.deletedAt = new Date();
  channel.deletedBy = userId;
  channel.updatedBy = userId;
  channel.active = false;
  await channel.save();
  return channel;
};
