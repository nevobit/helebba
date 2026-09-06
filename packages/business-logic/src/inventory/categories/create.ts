import { CategorySchemaMongo, type Category } from '@hlb/contracts';
import { Collection, getModel } from '@hlb/constant-definitions';

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const model = getModel<Category>(Collection.CATEGORIES, CategorySchemaMongo);
  const name = data.name?.trim();
  if (!name) throw new Error('Ingresa el nombre de la categoría.');

  const parentId = data.parentId || null;
  if (parentId) {
    const parent = await model.exists({
      _id: parentId,
      organizationId: data.organizationId,
      deletedAt: { $exists: false },
    });
    if (!parent) throw new Error('La categoría padre no existe o no pertenece a la organización.');
  }

  const category = new model({ ...data, name, parentId });
  const createdCategory = await category.save();

  return createdCategory;
};
