import { updateOrganizationDetails, type UpdateOrganizationDetails } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateMyOrganizationRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { userId } = req.auth as unknown as { userId: UserId };
    const organization = await updateOrganizationDetails({
      organizationId: req.organization?.organizationId as OrganizationId,
      userId,
      details: (req.body ?? {}) as UpdateOrganizationDetails,
    });

    reply.status(200).send({ organization });
  },
);
