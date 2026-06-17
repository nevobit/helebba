import { getContactById } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { ContactId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getContactByIdRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:contactId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { contactId } = req.params as { contactId: ContactId };
    const getedContactById = await getContactById(contactId);
    reply.status(200).send(getedContactById);
  },
);
