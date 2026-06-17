import { CategorySchemaMongo, type Category } from '@hlb/contracts';
import { Collection, getModel } from '@hlb/constant-definitions';

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const model = getModel<Category>(Collection.CATEGORIES, CategorySchemaMongo);
  const category = new model(data);
  const createdCategory = await category.save();

  return createdCategory;
};
