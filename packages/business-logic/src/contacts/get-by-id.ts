import { Collection, getModel } from "@hlb/constant-definitions";
import { type Contact, type ContactId, ContactSchemaMongo } from "@hlb/contracts";

export const getContactById = async (contactId: ContactId) => {
    const model = getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo);
    const result = await model.findById({contactId})
    return result
}