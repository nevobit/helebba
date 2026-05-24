import { deleteContact } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { ContactId } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';
export const deleteContactRoute = makeFastifyRoute(
    RouteMethod.DELETE,
    '/:contactId',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const {contactId} = req.params as {contactId: ContactId}
        const deletedContact = await deleteContact(contactId)
        reply.status(200).send(deletedContact)
    }
)