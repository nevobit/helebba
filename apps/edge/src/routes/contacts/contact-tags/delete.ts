import { deleteContactTag } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type ContactTagId, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deleteContactTagRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:tagId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { tagId } = req.params as { tagId: ContactTagId };
    reply
      .status(200)
      .send(
        await deleteContactTag(
          tagId,
          req.organization.organizationId as OrganizationId,
          req.auth.userId as UserId,
        ),
      );
  },
);
