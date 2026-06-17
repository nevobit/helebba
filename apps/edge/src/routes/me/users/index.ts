import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { inviteMyOrganizationUserRoute } from './invite';
import { listMyOrganizationUsersRoute } from './list';
import { resendMyOrganizationInvitationRoute } from './resend-invitation';
import { revokeMyOrganizationInvitationRoute } from './revoke-invitation';

export const meUserRoutes: RouteOptions[] = withPrefix('/users', [
  inviteMyOrganizationUserRoute,
  resendMyOrganizationInvitationRoute,
  revokeMyOrganizationInvitationRoute,
  listMyOrganizationUsersRoute,
]);
