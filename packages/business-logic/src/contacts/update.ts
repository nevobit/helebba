import { Collection, getModel } from "@hlb/constant-definitions";
import { ContactId, ContactSchemaMongo } from "@hlb/contracts";

export const updateContact = async (contactId: ContactId) => {
    const model = getModel(Collection.CONTACTS, ContactSchemaMongo);
    
}