import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ContactSchemaMongo,
  ContactTagSchemaMongo,
  LifecycleStatus,
  type Contact,
  type ContactTag,
  type ContactTagId,
  type OffsetPaginatedResult,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

type ListContactTagsParams = {
  organizationId: OrganizationId;
  page?: number;
  limit?: number;
  search?: string;
};

const tagModel = () => getModel<ContactTag>(Collection.CONTACT_TAGS, ContactTagSchemaMongo);
const activeTagScope = (organizationId: OrganizationId) => ({
  organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
});
const exactName = (name: string) => ({
  $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
  $options: 'i',
});

export const listContactTags = async ({
  organizationId,
  page = 1,
  limit = 100,
  search = '',
}: ListContactTagsParams): Promise<OffsetPaginatedResult<ContactTag>> => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(250, Math.max(1, limit));
  const normalizedSearch = search.trim();
  const filter = {
    ...activeTagScope(organizationId),
    ...(normalizedSearch
      ? { name: { $regex: normalizedSearch, $options: 'i' } }
      : {}),
  };
  const [items, total] = await Promise.all([
    tagModel().find(filter).sort({ name: 1 }).skip((safePage - 1) * safeLimit).limit(safeLimit),
    tagModel().countDocuments(filter),
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

export const getContactTag = async (
  tagId: ContactTagId,
  organizationId: OrganizationId,
): Promise<ContactTag> => {
  const tag = await tagModel().findOne({ _id: tagId, ...activeTagScope(organizationId) });
  if (!tag) throw new Error('La etiqueta de contactos no existe.');
  return tag;
};

export const createContactTag = async (data: Partial<ContactTag>): Promise<ContactTag> => {
  const name = data.name?.trim();
  if (!name) throw new Error('El nombre de la etiqueta es obligatorio.');
  if (!data.organizationId) throw new Error('La organización es obligatoria.');
  if (await tagModel().exists({ ...activeTagScope(data.organizationId), name: exactName(name) })) {
    throw new Error('Ya existe una etiqueta de contactos con ese nombre.');
  }
  return new (tagModel())({ ...data, name }).save();
};

export const updateContactTag = async (
  tagId: ContactTagId,
  organizationId: OrganizationId,
  data: Partial<ContactTag>,
): Promise<ContactTag> => {
  const tag = await tagModel().findOne({ _id: tagId, ...activeTagScope(organizationId) });
  if (!tag) throw new Error('La etiqueta de contactos no existe.');

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw new Error('El nombre de la etiqueta es obligatorio.');
    if (
      await tagModel().exists({
        ...activeTagScope(organizationId),
        _id: { $ne: tagId },
        name: exactName(name),
      })
    ) {
      throw new Error('Ya existe una etiqueta de contactos con ese nombre.');
    }
    tag.name = name;
  }
  if (data.color !== undefined) tag.color = data.color;
  if (data.updatedBy !== undefined) tag.updatedBy = data.updatedBy;
  await tag.save();
  return tag;
};

export const deleteContactTag = async (
  tagId: ContactTagId,
  organizationId: OrganizationId,
  deletedBy: UserId,
): Promise<ContactTag> => {
  const tag = await tagModel().findOne({ _id: tagId, ...activeTagScope(organizationId) });
  if (!tag) throw new Error('La etiqueta de contactos no existe o ya fue eliminada.');

  await getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo).updateMany(
    { organizationId, tags: { $in: [tagId, tag.name] } },
    { $pull: { tags: { $in: [tagId, tag.name] } } },
  );
  tag.lifecycleStatus = LifecycleStatus.DELETED;
  tag.deletedAt = new Date();
  tag.deletedBy = deletedBy;
  tag.updatedBy = deletedBy;
  await tag.save();
  return tag;
};
