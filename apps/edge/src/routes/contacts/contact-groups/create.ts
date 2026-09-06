import { createContactGroup } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type ContactGroup, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const createContactGroupRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const userId = req.auth.userId as UserId;
    const group = await createContactGroup({
      ...(req.body as Partial<ContactGroup>),
      organizationId: req.organization.organizationId as OrganizationId,
      createdBy: userId,
      updatedBy: userId,
    });
    reply.status(201).send(group);
  },
);
