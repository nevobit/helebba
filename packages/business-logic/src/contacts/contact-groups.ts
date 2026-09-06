import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ContactGroupSchemaMongo,
  ContactSchemaMongo,
  LifecycleStatus,
  type Contact,
  type ContactGroup,
  type GroupId,
  type OffsetPaginatedResult,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

type ListContactGroupsParams = {
  organizationId: OrganizationId;
  page?: number;
  limit?: number;
  search?: string;
};

const groupModel = () =>
  getModel<ContactGroup>(Collection.CONTACT_GROUPS, ContactGroupSchemaMongo);

const activeGroupScope = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
});

export const listContactGroups = async ({
  organizationId,
  page = 1,
  limit = 100,
  search = '',
}: ListContactGroupsParams): Promise<OffsetPaginatedResult<ContactGroup>> => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(250, Math.max(1, limit));
  const normalizedSearch = search.trim();
  const filter = {
    ...activeGroupScope(organizationId),
    ...(normalizedSearch
      ? {
          $or: [
            { name: { $regex: normalizedSearch, $options: 'i' } },
            { description: { $regex: normalizedSearch, $options: 'i' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    groupModel()
      .find(filter)
      .sort({ position: 1, name: 1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    groupModel().countDocuments(filter),
  ]);
  const pages = Math.ceil(total / safeLimit);

  return {
    kind: 'offset',
    count: total,
    items,
    pageInfo: {
      page: safePage,
      pageSize: safeLimit,
      totalItems: total,
      pages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < pages,
      previousPage: safePage > 1 ? safePage - 1 : null,
      nextPage: safePage < pages ? safePage + 1 : null,
    },
  };
};

export const getContactGroup = async (
  groupId: GroupId,
  organizationId: OrganizationId,
): Promise<ContactGroup> => {
  const group = await groupModel().findOne({ _id: groupId, ...activeGroupScope(organizationId) });
  if (!group) throw new Error('El grupo de contactos no existe.');
  return group;
};

export const createContactGroup = async (data: Partial<ContactGroup>): Promise<ContactGroup> => {
  const name = data.name?.trim();
  if (!name) throw new Error('El nombre del grupo es obligatorio.');
  if (!data.organizationId) throw new Error('La organización es obligatoria.');

  const duplicate = await groupModel().exists({
    ...activeGroupScope(data.organizationId),
    name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
  });
  if (duplicate) throw new Error('Ya existe un grupo de contactos con ese nombre.');

  return new (groupModel())({ ...data, name }).save();
};

export const updateContactGroup = async (
  groupId: GroupId,
  organizationId: OrganizationId,
  data: Partial<ContactGroup>,
): Promise<ContactGroup> => {
  const group = await groupModel().findOne({ _id: groupId, ...activeGroupScope(organizationId) });
  if (!group) throw new Error('El grupo de contactos no existe.');

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw new Error('El nombre del grupo es obligatorio.');
    const duplicate = await groupModel().exists({
      ...activeGroupScope(organizationId),
      _id: { $ne: groupId },
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
    if (duplicate) throw new Error('Ya existe un grupo de contactos con ese nombre.');
    group.name = name;
  }
  if (data.description !== undefined) group.description = data.description;
  if (data.color !== undefined) group.color = data.color;
  if (data.position !== undefined) group.position = data.position;
  if (data.updatedBy !== undefined) group.updatedBy = data.updatedBy;

  await group.save();
  return group;
};

export const deleteContactGroup = async (
  groupId: GroupId,
  organizationId: OrganizationId,
  deletedBy: UserId,
): Promise<ContactGroup> => {
  const group = await groupModel().findOne({ _id: groupId, ...activeGroupScope(organizationId) });
  if (!group) throw new Error('El grupo de contactos no existe o ya fue eliminado.');

  const inUse = await getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo).exists({
    organizationId,
    groupId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (inUse) throw new Error('No puedes eliminar un grupo asignado a contactos.');

  group.lifecycleStatus = LifecycleStatus.DELETED;
  group.deletedAt = new Date();
  group.deletedBy = deletedBy;
  group.updatedBy = deletedBy;
  await group.save();
  return group;
};
