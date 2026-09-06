import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CategorySchemaMongo,
  LifecycleStatus,
  type Category,
  type CategoryId,
  type OrganizationId,
} from '@hlb/contracts';
import { slugify } from '@hlb/foundation';

export const updateCategory = async (
  categoryId: CategoryId,
  organizationId: OrganizationId,
  data: Partial<Category>,
) => {
  const model = getModel<Category>(Collection.CATEGORIES, CategorySchemaMongo);
  const category = await model.findOne({
    _id: categoryId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!category) throw new Error('La categoría no existe o no pertenece a la organización.');

  const name = data.name?.trim();
  if (!name) throw new Error('Ingresa el nombre de la categoría.');
  const parentId = data.parentId || null;
  if (parentId && String(parentId) === String(categoryId)) {
    throw new Error('Una categoría no puede ser su propia categoría padre.');
  }

  let ancestorId = parentId;
  const visited = new Set<string>();
  while (ancestorId) {
    const id = String(ancestorId);
    if (id === String(categoryId) || visited.has(id)) {
      throw new Error('La categoría padre seleccionada crearía un ciclo en la jerarquía.');
    }
    visited.add(id);
    const ancestor = await model.findOne({
      _id: ancestorId,
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    }).select({ parentId: 1 });
    if (!ancestor) throw new Error('La categoría padre no existe o no pertenece a la organización.');
    ancestorId = ancestor.parentId;
  }

  const updated = await model.findOneAndUpdate(
    { _id: categoryId, organizationId },
    {
      $set: {
        name,
        slug: slugify(name),
        description: data.description ?? '',
        type: data.type ?? 'options',
        color: data.color,
        icon: data.icon ?? '',
        options: data.options ?? [],
        position: data.position ?? 0,
        showInCatalog: Boolean(data.showInCatalog),
        parentId,
        updatedBy: data.updatedBy,
      },
    },
    { new: true, runValidators: true },
  );
  if (!updated) throw new Error('No pudimos actualizar la categoría.');
  return updated;
};
