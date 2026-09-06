import { createContactTag } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type ContactTag, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const createContactTagRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const userId = req.auth.userId as UserId;
    const tag = await createContactTag({
      ...(req.body as Partial<ContactTag>),
      organizationId: req.organization.organizationId as OrganizationId,
      createdBy: userId,
      updatedBy: userId,
    });
    reply.status(201).send(tag);
  },
);
