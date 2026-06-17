import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  LifecycleStatus,
  type Document as SalesDocument,
  type DocumentType,
  type OffsetPaginatedResult,
  type Params,
} from '@hlb/contracts';

type DocumentListParams = Params<{
  docType: DocumentType;
  paymentMethodId?: string;
}>;

export const getAllDocuments = async (
  params: DocumentListParams,
): Promise<OffsetPaginatedResult<SalesDocument>> => {
  const { page = 1, limit = 100, paymentMethodId, search = '', organizationId, docType } = params;
  const model = getModel<SalesDocument>(Collection.DOCUMENTS, DocumentSchemaMongo);
  const skip = (page - 1) * limit;
  const normalizedSearch = search.trim();
  const filter = {
    organizationId,
    docType,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    ...(paymentMethodId ? { paymentMethodId } : {}),
    ...(normalizedSearch
      ? {
          $or: [
            { docNumber: { $regex: normalizedSearch, $options: 'i' } },
            { contactName: { $regex: normalizedSearch, $options: 'i' } },
            { description: { $regex: normalizedSearch, $options: 'i' } },
          ],
        }
      : {}),
  };

  const documents = await model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await model.countDocuments(filter);
  const pages = Math.ceil(total / limit);

  return {
    kind: 'offset',
    count: total,
    items: documents,
    pageInfo: {
      page,
      pages,
      pageSize: limit,
      totalItems: total,
      hasPreviousPage: page > 1,
      hasNextPage: page < pages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < pages ? page + 1 : null,
    },
  };
};
