import { deleteContact } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { ContactId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
export const deleteContactRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:contactId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { contactId } = req.params as { contactId: ContactId };
    const deletedContact = await deleteContact(
      contactId,
      req.organization?.organizationId as OrganizationId,
      (req.auth as unknown as { userId: UserId }).userId,
    );
    reply.status(200).send(deletedContact);
  },
);
