import { Collection, getModel } from '@hlb/constant-definitions';
import { type ContactId, ContactSchemaMongo } from '@hlb/contracts';

export const deleteContact = async (contactId: ContactId) => {
  const model = getModel(Collection.CONTACTS, ContactSchemaMongo);
  const result = await model.deleteOne({ _id: contactId });
  if (!result.acknowledged) throw new Error('Could not delete contact');
  return result.deletedCount > 0;
};
