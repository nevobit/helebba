import { updateContactTag } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import {
  type ContactTag,
  type ContactTagId,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateContactTagRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:tagId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { tagId } = req.params as { tagId: ContactTagId };
    const tag = await updateContactTag(tagId, req.organization.organizationId as OrganizationId, {
      ...(req.body as Partial<ContactTag>),
      updatedBy: req.auth.userId as UserId,
    });
    reply.status(200).send(tag);
  },
);
