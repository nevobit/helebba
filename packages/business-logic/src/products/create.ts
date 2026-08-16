import {
  ProductFieldDefinitionSchemaMongo,
  ProductSchemaMongo,
  type Product,
  type ProductFieldDefinition,
} from '@hlb/contracts';
import { getModel, Collection } from '@hlb/constant-definitions';

const isValidFieldValue = (definition: ProductFieldDefinition, value: unknown) => {
  if (value === null || value === undefined || value === '') return !definition.required;
  if (definition.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (definition.type === 'boolean') return typeof value === 'boolean';
  if (definition.type === 'multi-select') {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
  }
  return typeof value === 'string';
};

const validateCustomFields = async (data: Partial<Product>) => {
  const fields = data.customFields ?? [];
  const definitionIds = fields.flatMap((field) => (field.definitionId ? [field.definitionId] : []));

  const definitionModel = getModel<ProductFieldDefinition>(
    Collection.PRODUCT_FIELD_DEFINITIONS,
    ProductFieldDefinitionSchemaMongo,
  );
  const definitions = await definitionModel.find({
    organizationId: data.organizationId,
    active: true,
    target: 'product',
    $or: [
      { appliesTo: 'all' },
      ...(data.categoryId ? [{ appliesTo: 'categories', categoryIds: data.categoryId }] : []),
    ],
  });
  const byId = new Map(definitions.map((definition) => [String(definition.id), definition]));

  for (const field of fields) {
    if (!field.definitionId) continue;
    const definition = byId.get(String(field.definitionId));
    if (!definition) throw new Error('Uno de los campos personalizados no es válido para esta organización.');
    if (!isValidFieldValue(definition, field.value)) {
      throw new Error(`El valor del campo “${definition.label}” no es válido.`);
    }
  }

  for (const definition of definitions) {
    if (!definition.required) continue;
    const field = fields.find((item) => String(item.definitionId) === String(definition.id));
    if (!field || !isValidFieldValue(definition, field.value)) {
      throw new Error(`El campo “${definition.label}” es obligatorio.`);
    }
  }

  if (definitionIds.some((id) => !byId.has(String(id)))) {
    throw new Error('Uno de los campos personalizados no aplica a este producto.');
  }
};

export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  await validateCustomFields(data);
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const product = new model(data);
  const createdProduct = await product.save();
  return createdProduct;
};
