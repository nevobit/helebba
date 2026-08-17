import { api } from '@/shared/api';
import type { CategoryId, ProductFieldDefinition, ProductFieldDefinitionId } from '@hlb/contracts';

export type ProductFieldDefinitionListParams = {
  categoryId?: CategoryId;
  categoryIds?: CategoryId[];
  includeInactive?: boolean;
};

export type ProductFieldDefinitionPayload = Partial<
  Pick<
    ProductFieldDefinition,
    | 'active'
    | 'appliesTo'
    | 'categoryIds'
    | 'defaultValue'
    | 'key'
    | 'label'
    | 'options'
    | 'order'
    | 'required'
    | 'target'
    | 'type'
  >
>;

export const productFieldDefinitions = async (params: ProductFieldDefinitionListParams = {}) => {
  const { data } = await api.get<ProductFieldDefinition[]>('/product-field-definitions', {
    params: { ...params, categoryIds: params.categoryIds?.join(',') || undefined },
  });
  return data;
};

export const createProductFieldDefinition = async (payload: ProductFieldDefinitionPayload) => {
  const { data } = await api.post<ProductFieldDefinition>('/product-field-definitions', payload);
  return data;
};

export const updateProductFieldDefinition = async (
  definitionId: ProductFieldDefinitionId,
  payload: ProductFieldDefinitionPayload,
) => {
  const { data } = await api.patch<ProductFieldDefinition>(
    `/product-field-definitions/${definitionId}`,
    payload,
  );
  return data;
};

export const removeProductFieldDefinition = async (definitionId: ProductFieldDefinitionId) => {
  const { data } = await api.delete<ProductFieldDefinition>(`/product-field-definitions/${definitionId}`);
  return data;
};
