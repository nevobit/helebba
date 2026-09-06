import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CategorySchemaMongo,
  LifecycleStatus,
  ProductFieldDefinitionSchemaMongo,
  ProductSchemaMongo,
  type Category,
  type CategoryId,
  type OrganizationId,
  type Product,
  type ProductFieldDefinition,
  type UserId,
} from '@hlb/contracts';

export const deleteCategory = async (
  categoryId: CategoryId,
  organizationId: OrganizationId,
  deletedBy: UserId,
) => {
  const categoryModel = getModel<Category>(Collection.CATEGORIES, CategorySchemaMongo);
  const category = await categoryModel.findOne({
    _id: categoryId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!category) throw new Error('La categoría no existe o ya fue eliminada.');

  const [hasChildren, hasProducts, hasFieldDefinitions] = await Promise.all([
    categoryModel.exists({
      parentId: categoryId,
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    }),
    getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo).exists({
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
      $or: [{ categoryId }, { categories: categoryId }],
    }),
    getModel<ProductFieldDefinition>(
      Collection.PRODUCT_FIELD_DEFINITIONS,
      ProductFieldDefinitionSchemaMongo,
    ).exists({ organizationId, categoryIds: categoryId, active: true }),
  ]);

  if (hasChildren) throw new Error('No puedes eliminar una categoría que tiene subcategorías.');
  if (hasProducts) throw new Error('No puedes eliminar una categoría que tiene productos asignados.');
  if (hasFieldDefinitions) {
    throw new Error('No puedes eliminar una categoría utilizada por campos personalizados activos.');
  }

  await categoryModel.updateOne(
    { _id: categoryId, organizationId },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy,
        updatedBy: deletedBy,
      },
    },
  );
  return true;
};
