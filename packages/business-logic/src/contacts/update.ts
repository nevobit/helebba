import { Collection, getModel } from "@hlb/constant-definitions";
import { type Contact, type ContactId, ContactSchemaMongo } from "@hlb/contracts";

export const updateContact = async (contactId: ContactId, data: Partial<Contact>) => {
    const model = getModel(Collection.CONTACTS, ContactSchemaMongo);
    const dataUpDate = {
        ...data,
        updatedAt: new Date().toISOString(),
    };

    const result = await model.updateOne({_id: contactId}, {$set: dataUpDate});

    if(!result.acknowledged && result.matchedCount < 1) throw new Error('could not update contact')

    const conatct = await model.findById(contactId)
    return conatct;
}