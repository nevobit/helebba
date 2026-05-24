import { updateContact } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { Contact, ContactId } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';

export const updateContactRoute = makeFastifyRoute(
    RouteMethod.PATCH,
    '/:contactId',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const body = req.body as Partial<Contact>;
        const {contactId} = req.params as {contactId: ContactId};
        const updatedContact = await updateContact(contactId, body);
        reply.status(200).send(updatedContact);
    }
);