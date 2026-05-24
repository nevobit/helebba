import { softDeleteContact } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { ContactId } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';

export const softDeleteContactRoute = makeFastifyRoute(
    RouteMethod.PATCH,
    '/:contactId',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const {contactId} = req.params as {contactId: ContactId};
        const softDeletedContact = await softDeleteContact(contactId);
        reply.status(200).send(softDeletedContact);
    }
)