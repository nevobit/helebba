import { createContact } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { Contact } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';

export const createContactRoute = makeFastifyRoute(
    RouteMethod.POST,
    '/',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const body = req.body as Partial<Contact>;
        const { userId } = req.auth as { userId: string };
        const contact = await createContact({...body, tenantId: req.tenant?.tenantId, userId});
        reply.status(201).send(contact)
    } 
)