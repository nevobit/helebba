import { Collection, getModel } from '@hlb/constant-definitions';
import {
  type Contact,
  ContactSchemaMongo,
  type PaginatedResult,
  type Params,
} from '@hlb/contracts';

export const getAllContacts = async (params: Params): Promise<PaginatedResult<Contact>> => {
  const { page = 1, limit = 10, search = '', organizationId } = params;

  const model = getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo);

  const skip = (page - 1) * limit;

  const contacts = await model.find({ organizationId }).skip(skip).limit(limit);

  const total = await model.countDocuments({ organizationId });

  const pages = Math.ceil(total / limit);

  const hasPreviousPage = page > 1;
  const previousPage = hasPreviousPage ? page - 1 : null;
  const hasNextPage = page < pages;
  const nextPage = hasNextPage ? page + 1 : null;

  return {
    kind: 'offset',
    count: total,
    items: contacts,
    pageInfo: {
      page,
      pages,
      pageSize: limit,
      totalItems: total,
      hasPreviousPage,
      hasNextPage,
      previousPage,
      nextPage,
    },
  };
};
