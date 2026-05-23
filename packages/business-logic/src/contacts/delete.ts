import { Collection, getModel } from "@hlb/constant-definitions";
import { ContactId, ContactSchemaMongo } from "@hlb/contracts";

export const deleteContact = async (contactId: ContactId) => {
    const model = getModel(Collection.CONTACTS, ContactSchemaMongo);
    const result = await model.deleteOne(contactId)

    if (!result.acknowledged) {
        
    }
}