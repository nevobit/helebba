import { withPrefix } from '@hlb/constant-definitions';
import { RouteOptions } from 'fastify';
import { createContactRoute } from './create';
import { updateContactRoute } from './update';
import { deleteContactRoute } from './delete';
import { softDeleteContactRoute } from './soft-delete';
import { getContactByIdRoute } from './get-by-id';
import { listContactsRoute } from './list';
import { contactAttachmentRoutes } from './attachments';
import { bulkContactRoutes } from './bulk';

export const contactRoutes: RouteOptions[] = withPrefix('/contacts', [
  ...bulkContactRoutes,
  listContactsRoute,
  createContactRoute,
  updateContactRoute,
  deleteContactRoute,
  softDeleteContactRoute,
  getContactByIdRoute,
  ...contactAttachmentRoutes,
]);
