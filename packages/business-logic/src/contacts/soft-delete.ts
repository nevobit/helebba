import { Collection, getModel } from '@hlb/constant-definitions';
import { type Contact, type ContactId, ContactSchemaMongo, LifecycleStatus } from '@hlb/contracts';

export const softDeleteContact = async (contactId: ContactId) => {
  const model = getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo);
  const result = await model.updateOne(
    { _id: contactId },
    { $set: { lifecycleStatus: LifecycleStatus.DELETED } },
  );

  if (!result.acknowledged && result.matchedCount < 1) throw new Error('Could not update product');

  const contact = await model.findById(contactId);
  return contact;
};
