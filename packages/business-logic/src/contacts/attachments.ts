import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  type Contact,
  type ContactAttachment,
  type ContactId,
  ContactSchemaMongo,
  LifecycleStatus,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

type ContactParams = { contactId: ContactId; organizationId: OrganizationId };
type AttachmentInput = Pick<ContactAttachment, 'name' | 'url'> &
  Partial<Pick<ContactAttachment, 'contentType' | 'size'>>;

const contactError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

const activeContactFilter = ({ contactId, organizationId }: ContactParams) => ({
  _id: contactId,
  organizationId,
  lifecycleStatus: { $ne: LifecycleStatus.DELETED },
});

export const attachContactFile = async (
  params: ContactParams & { attachment: AttachmentInput; userId: UserId },
) => {
  const name = params.attachment.name?.trim();
  const url = params.attachment.url?.trim();
  if (!name || !url) throw contactError('Attachment name and URL are required', 400);
  if (params.attachment.size !== undefined && params.attachment.size < 0) {
    throw contactError('Attachment size cannot be negative', 400);
  }

  const attachment: ContactAttachment = {
    id: randomUUID(),
    name,
    url,
    contentType: params.attachment.contentType?.trim() || undefined,
    size: params.attachment.size,
    createdAt: new Date().toISOString(),
    createdBy: params.userId,
  };
  const contact = await getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo).findOneAndUpdate(
    activeContactFilter(params),
    { $push: { attachments: attachment }, $set: { updatedBy: params.userId } },
    { new: true },
  );
  if (!contact) throw contactError('Contact not found', 404);
  return attachment;
};

export const listContactAttachments = async (params: ContactParams) => {
  const contact = await getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo).findOne(
    activeContactFilter(params),
  );
  if (!contact) throw contactError('Contact not found', 404);
  return contact.attachments ?? [];
};

export const getContactAttachment = async (
  params: ContactParams & { attachmentId?: string; filename?: string },
) => {
  const attachments = await listContactAttachments(params);
  const attachment = attachments.find(
    (item) => item.id === params.attachmentId || item.name === params.filename,
  );
  if (!attachment) throw contactError('Attachment not found', 404);
  return attachment;
};

export const getContactPortalLink = async (params: ContactParams) => {
  const model = getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo);
  const existing = await model
    .findOne(activeContactFilter(params))
    .select('+portalAccessToken');
  if (!existing) throw contactError('Contact not found', 404);

  const token = existing.portalAccessToken || randomUUID();
  if (!existing.portalAccessToken) {
    await model.updateOne(activeContactFilter(params), { $set: { portalAccessToken: token } });
  }
  const appUrl = (
    process.env.PUBLIC_APP_URL ??
    process.env.WEB_APP_URL ??
    process.env.FRONTEND_URL ??
    'http://localhost:5174'
  ).replace(/\/$/, '');
  return { url: `${appUrl}/portal/contacts/${params.contactId}?token=${token}` };
};
