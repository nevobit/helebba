import { Collection, getModel } from "@hlb/constant-definitions";
import { ContactId, ContactSchemaMongo, LifecycleStatus } from "@hlb/contracts";


export const softDeleteContact = async (contactId: ContactId) => {
    const model = getModel(Collection.CONTACTS, ContactSchemaMongo);
    const result = await model.updateOne(
        {id: contactId},
        {$set: {LifecycleStatus: LifecycleStatus.DELETED}}
    );

    if (!result.acknowledged && result.matchedCount < 1) throw new Error('Could not update product');
    
    const contact = model.findById(contactId)
    return contact;
}