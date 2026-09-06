import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createContactTagRoute } from './create';
import { listContactTagsRoute } from './list';
import { getContactTagRoute } from './get';
import { updateContactTagRoute } from './update';
import { deleteContactTagRoute } from './delete';

export const contactTagRoutes: RouteOptions[] = withPrefix('/contact-tags', [
  listContactTagsRoute,
  createContactTagRoute,
  getContactTagRoute,
  updateContactTagRoute,
  deleteContactTagRoute,
]);
