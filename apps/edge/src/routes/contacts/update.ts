import { updateContact } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { Contact, ContactId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateContactRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:contactId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = req.body as Partial<Contact>;
    const { contactId } = req.params as { contactId: ContactId };
    const { userId } = req.auth as unknown as { userId: UserId };
    const updatedContact = await updateContact(
      contactId,
      req.organization?.organizationId as OrganizationId,
      { ...body, updatedBy: userId },
    );
    reply.status(200).send(updatedContact);
  },
);
