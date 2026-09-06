import { softDeleteContact } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { ContactId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const softDeleteContactRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:contactId/delete',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { contactId } = req.params as { contactId: ContactId };
    const softDeletedContact = await softDeleteContact(
      contactId,
      req.organization?.organizationId as OrganizationId,
      (req.auth as unknown as { userId: UserId }).userId,
    );
    reply.status(200).send(softDeletedContact);
  },
);
