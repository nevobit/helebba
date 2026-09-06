import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductFieldDefinitionSchemaMongo,
  type ProductFieldDefinition,
} from '@hlb/contracts';
import { slugify } from '@hlb/foundation';

export const createProductFieldDefinition = async (
  data: Partial<ProductFieldDefinition>,
): Promise<ProductFieldDefinition> => {
  const model = getModel<ProductFieldDefinition>(
    Collection.PRODUCT_FIELD_DEFINITIONS,
    ProductFieldDefinitionSchemaMongo,
  );
  const key = slugify(data.key || data.label || '').replace(/-/g, '_');

  if (!key || !data.label?.trim()) throw new Error('El nombre del campo es obligatorio.');

  const definition = new model({
    ...data,
    key,
    label: data.label.trim(),
    target: data.target ?? 'product',
    appliesTo: data.appliesTo ?? 'all',
    categoryIds: data.categoryIds ?? [],
    options: data.options ?? [],
    active: data.active ?? true,
    required: data.required ?? false,
    order: data.order ?? 0,
    defaultValue: data.defaultValue ?? null,
  });

  return definition.save();
};
