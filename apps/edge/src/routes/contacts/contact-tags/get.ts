import { getContactTag } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type ContactTagId, type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getContactTagRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:tagId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { tagId } = req.params as { tagId: ContactTagId };
    reply
      .status(200)
      .send(await getContactTag(tagId, req.organization.organizationId as OrganizationId));
  },
);
