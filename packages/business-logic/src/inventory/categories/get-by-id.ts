import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CategorySchemaMongo,
  LifecycleStatus,
  type Category,
  type CategoryId,
  type OrganizationId,
} from '@hlb/contracts';

export const getCategoryById = async (
  categoryId: CategoryId,
  organizationId: OrganizationId,
): Promise<Category | null> => {
  const model = getModel<Category>(Collection.CATEGORIES, CategorySchemaMongo);

  return model.findOne({
    _id: categoryId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
};
