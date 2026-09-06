import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  ProductFieldDefinitionSchemaMongo,
  type CategoryId,
  type OrganizationId,
  type ProductFieldDefinition,
} from '@hlb/contracts';

type ListProductFieldDefinitionsInput = {
  organizationId: OrganizationId;
  categoryId?: CategoryId;
  categoryIds?: CategoryId[];
  includeInactive?: boolean;
  target?: 'product' | 'variant';
};

export const listProductFieldDefinitions = async ({
  organizationId,
  categoryId,
  categoryIds = [],
  includeInactive = false,
  target = 'product',
}: ListProductFieldDefinitionsInput): Promise<ProductFieldDefinition[]> => {
  const model = getModel<ProductFieldDefinition>(
    Collection.PRODUCT_FIELD_DEFINITIONS,
    ProductFieldDefinitionSchemaMongo,
  );
  const applicableCategoryIds = [categoryId, ...categoryIds].filter(Boolean) as CategoryId[];
  const filter = {
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    target,
    ...(!includeInactive ? { active: true } : {}),
    ...(!includeInactive && applicableCategoryIds.length === 0 ? { appliesTo: 'all' } : {}),
    ...(applicableCategoryIds.length
      ? { $or: [{ appliesTo: 'all' }, { appliesTo: 'categories', categoryIds: { $in: applicableCategoryIds } }] }
      : {}),
  };

  return model.find(filter).sort({ order: 1, createdAt: 1 });
};
