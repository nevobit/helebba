import { Collection, getModel } from "@hlb/constant-definitions";
import { Contact, ContactSchemaMongo, PaginatedResult, Params } from "@hlb/contracts";

export const getAllContacts = async (params:Params): Promise<PaginatedResult<Contact>> => {
    const {page = 1, limit = 10, search = '', tenantId} = params;
    
    const model = getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo);

    const skip = (page - 1) * limit;

    const contacts = await model.find({ tenantId }).skip(skip).limit(limit);

    const total = await model.countDocuments({ tenantId });

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
}