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
  includeInactive?: boolean;
  target?: 'product' | 'variant';
};

export const listProductFieldDefinitions = async ({
  organizationId,
  categoryId,
  includeInactive = false,
  target = 'product',
}: ListProductFieldDefinitionsInput): Promise<ProductFieldDefinition[]> => {
  const model = getModel<ProductFieldDefinition>(
    Collection.PRODUCT_FIELD_DEFINITIONS,
    ProductFieldDefinitionSchemaMongo,
  );
  const filter = {
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    target,
    ...(!includeInactive ? { active: true } : {}),
    ...(!includeInactive && !categoryId ? { appliesTo: 'all' } : {}),
    ...(categoryId
      ? { $or: [{ appliesTo: 'all' }, { appliesTo: 'categories', categoryIds: categoryId }] }
      : {}),
  };

  return model.find(filter).sort({ order: 1, createdAt: 1 });
};
