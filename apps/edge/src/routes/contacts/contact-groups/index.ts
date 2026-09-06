import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createContactGroupRoute } from './create';
import { listContactGroupsRoute } from './list';
import { getContactGroupRoute } from './get';
import { updateContactGroupRoute } from './update';
import { deleteContactGroupRoute } from './delete';

export const contactGroupRoutes: RouteOptions[] = withPrefix('/contact-groups', [
  listContactGroupsRoute,
  createContactGroupRoute,
  getContactGroupRoute,
  updateContactGroupRoute,
  deleteContactGroupRoute,
]);
