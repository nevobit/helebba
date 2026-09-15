import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ContactSchemaMongo,
  LifecycleStatus,
  type Contact,
  type ContactId,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

const model = () => getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo);

const uniqueIds = (contactIds: readonly ContactId[]) =>
  [...new Set(contactIds.map(String).filter(Boolean))] as ContactId[];

export const bulkArchiveContacts = async (
  contactIds: readonly ContactId[],
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const ids = uniqueIds(contactIds);
  if (!ids.length) throw new Error('Debes seleccionar al menos un contacto.');
  const result = await model().updateMany(
    {
      _id: { $in: ids },
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.ARCHIVED,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    },
  );
  return { requested: ids.length, archived: result.modifiedCount };
};

export const bulkDeleteContacts = async (
  contactIds: readonly ContactId[],
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const ids = uniqueIds(contactIds);
  if (!ids.length) throw new Error('Debes seleccionar al menos un contacto.');
  const now = new Date();
  const result = await model().updateMany(
    { _id: { $in: ids }, organizationId },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: now,
        deletedBy: userId,
        updatedAt: now,
        updatedBy: userId,
      },
    },
  );
  return { requested: ids.length, deleted: result.modifiedCount };
};
