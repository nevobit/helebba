import { createOrganization, loginOrganization } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type Organization, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { problem } from '../../access/auth/responses';

type CreateOrganizationBody = Pick<
  Organization,
  'legalName' | 'type' | 'size' | 'country' | 'structure'
> &
  Partial<Pick<Organization, 'website'>>;

export const createMyOrganizationRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'none', auth: 'required' },
  async (req, reply) => {
    const body = (req.body ?? {}) as Partial<CreateOrganizationBody>;
    const { userId } = req.auth as unknown as { userId: UserId };

    if (!body.legalName) {
      problem(reply, 400, 'Legal name is required', 'legal_name_required');
      return;
    }

    const out = await createOrganization({
      userId,
      organization: {
        legalName: body.legalName,
        type: body.type ?? 'company',
        size: body.size ?? '1',
        country: body.country ?? 'CO',
        structure: body.structure ?? 'company',
        website: body.website,
      },
    });
    const session = await loginOrganization({
      userId,
      organizationId: out.organization.id,
    });

    reply.status(201).send({
      organization: out.organization,
      subscription: out.subscription,
      membershipId: session.membershipId,
      roleId: session.roleId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  },
);
