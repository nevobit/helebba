import { Collection, getModel } from '@hlb/constant-definitions';
import {
  type Contact,
  ContactSchemaMongo,
  LifecycleStatus,
  type PaginatedResult,
  type Params,
} from '@hlb/contracts';

type ContactScope = 'all' | 'companies' | 'people';

type ContactListParams = Params & {
  scope?: ContactScope;
};

export const getAllContacts = async (
  params: ContactListParams,
): Promise<PaginatedResult<Contact>> => {
  const { page = 1, limit = 10, search = '', organizationId, scope = 'all' } = params;

  const model = getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const skip = (normalizedPage - 1) * normalizedLimit;
  const query: Record<string, unknown> = {
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  };

  if (scope === 'companies') query.isPerson = false;
  if (scope === 'people') query.isPerson = true;

  if (search.trim()) {
    const pattern = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { name: pattern },
      { tradeName: pattern },
      { customId: pattern },
      { email: pattern },
      { phone: pattern },
      { mobile: pattern },
    ];
  }

  const contacts = await model
    .find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(normalizedLimit);

  const total = await model.countDocuments(query);

  const pages = Math.max(Math.ceil(total / normalizedLimit), 1);

  const hasPreviousPage = normalizedPage > 1;
  const previousPage = hasPreviousPage ? normalizedPage - 1 : null;
  const hasNextPage = normalizedPage < pages;
  const nextPage = hasNextPage ? normalizedPage + 1 : null;

  return {
    kind: 'offset',
    count: total,
    items: contacts,
    pageInfo: {
      page: normalizedPage,
      pages,
      pageSize: normalizedLimit,
      totalItems: total,
      hasPreviousPage,
      hasNextPage,
      previousPage,
      nextPage,
    },
  };
};
