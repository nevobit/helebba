import { createContact } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { Contact, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const createContactRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = req.body as Partial<Contact>;
    const { userId } = req.auth as unknown as { userId: UserId };
    const contact = await createContact({
      ...body,
      organizationId: req.organization?.organizationId! as OrganizationId,
      createdBy: userId,
    });
    reply.status(201).send(contact);
  },
);
