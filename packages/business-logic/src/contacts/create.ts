import { Collection, getModel } from "@hlb/constant-definitions";
import { Contact, ContactSchemaMongo } from "@hlb/contracts";

export const createContact = async(data: Contact): Promise<Contact> => {

    const model = getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo);

    const contact = new model(data);

    const createdContact = await contact.save();

    return createdContact;
}

