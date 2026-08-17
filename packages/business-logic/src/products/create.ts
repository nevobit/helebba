import {
  BrandSchemaMongo,
  CategorySchemaMongo,
  ContactSchemaMongo,
  ProductFieldDefinitionSchemaMongo,
  ProductSchemaMongo,
  ProductStockState,
  LifecycleStatus,
  WarehouseSchemaMongo,
  type Category,
  type Contact,
  type InventoryBrand,
  type Product,
  type ProductId,
  type ProductFieldDefinition,
  type Warehouse,
} from '@hlb/contracts';
import { getModel, Collection } from '@hlb/constant-definitions';
import { slugify } from '@hlb/foundation';
import { randomUUID } from 'node:crypto';

const isValidFieldValue = (definition: ProductFieldDefinition, value: unknown) => {
  if (value === null || value === undefined || value === '') return !definition.required;
  if (definition.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (definition.type === 'boolean') return typeof value === 'boolean';
  if (definition.type === 'multi-select') {
    const allowedValues = new Set(definition.options.map((option) => option.value));
    return Array.isArray(value) && value.every((item) => typeof item === 'string' && allowedValues.has(item));
  }
  if (definition.type === 'select') {
    return typeof value === 'string' && definition.options.some((option) => option.value === value);
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
  const applicableCategoryIds = [data.categoryId, ...(data.categories ?? [])].filter(Boolean);
  const definitions = await definitionModel.find({
    organizationId: data.organizationId,
    active: true,
    target: 'product',
    $or: [
      { appliesTo: 'all' },
      ...(applicableCategoryIds.length ? [{ appliesTo: 'categories', categoryIds: { $in: applicableCategoryIds } }] : []),
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

export const prepareProductData = async (data: Partial<Product>, productId?: ProductId): Promise<Partial<Product>> => {
  const organizationId = data.organizationId;
  const categoryModel = getModel<Category>(Collection.CATEGORIES, CategorySchemaMongo);
  const rawSecondaryCategories = (data.categories ?? []).map(String).filter(Boolean);
  const secondaryCategoryDocuments = rawSecondaryCategories.length
    ? await categoryModel.find({
        organizationId,
        lifecycleStatus: { $ne: LifecycleStatus.DELETED },
        $or: [{ _id: { $in: rawSecondaryCategories } }, { name: { $in: rawSecondaryCategories } }],
      }).select({ name: 1 })
    : [];
  const resolvedSecondaryCategories = rawSecondaryCategories.map((value) => {
    const category = secondaryCategoryDocuments.find(
      (item) => String(item.id) === value || item.name === value,
    );
    return category?.id;
  });
  if (resolvedSecondaryCategories.some((categoryId) => !categoryId)) {
    throw new Error('Una o más categorías secundarias no existen o no pertenecen a la organización.');
  }
  const secondaryCategoryIds = [...new Set(resolvedSecondaryCategories.map(String))]
    .filter((categoryId) => categoryId !== String(data.categoryId));
  data = { ...data, categories: secondaryCategoryIds as Product['categories'] };
  await validateCustomFields(data);
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const numericValues = [data.price, data.cost, data.purchasePrice, data.weight, data.stock, data.taxRate];
  if (numericValues.some((value) => value !== undefined && (!Number.isFinite(value) || value < 0))) {
    throw new Error('Los precios, costes, peso, impuesto y stock deben ser números positivos.');
  }
  if ((data.taxRate ?? 0) > 100) throw new Error('El impuesto debe estar entre 0 y 100.');
  if (data.variants?.length && (data.manageLots || data.manageSerials)) {
    throw new Error('Un producto con variantes no puede gestionar lotes o números de serie.');
  }
  if (!data.hasStock && (data.manageLots || data.manageSerials)) {
    throw new Error('La gestión de lotes o números de serie requiere activar el stock.');
  }
  if (data.hasStock && !data.warehouseId) {
    throw new Error('Selecciona un almacén para gestionar el stock.');
  }
  if (data.inCatalog && !data.forSale) {
    throw new Error('Un producto visible en catálogo debe estar disponible para venta.');
  }
  const variantsWithNormalizedColors = (data.variants ?? []).map((variant) => {
    const legacyColor = variant.color as unknown;
    const color = typeof legacyColor === 'string'
      ? { name: '', hex: legacyColor.trim().toUpperCase() }
      : legacyColor;
    if (
      !color ||
      typeof color !== 'object' ||
      typeof (color as { name?: unknown }).name !== 'string' ||
      typeof (color as { hex?: unknown }).hex !== 'string' ||
      !/^#[0-9A-F]{6}$/i.test((color as { hex: string }).hex)
    ) {
      throw new Error('El color de cada variante debe incluir un nombre y un código HEX válido.');
    }
    return { ...variant, color: color as Product['variants'][number]['color'] };
  });
  for (const variant of variantsWithNormalizedColors) {
    if ([variant.price, variant.cost, variant.purchasePrice, variant.weight, variant.stock].some(
      (value) => !Number.isFinite(value) || value < 0,
    )) {
      throw new Error('Los valores numéricos de las variantes deben ser iguales o mayores que cero.');
    }
  }
  const hasDuplicates = (values: string[]) => {
    const normalized = values.map((value) => value.trim()).filter(Boolean);
    return new Set(normalized).size !== normalized.length;
  };
  if (hasDuplicates(variantsWithNormalizedColors.map((variant) => variant.sku))) {
    throw new Error('Los SKU de las variantes no pueden repetirse.');
  }
  if (hasDuplicates(variantsWithNormalizedColors.map((variant) => variant.barcode))) {
    throw new Error('Los códigos de barras de las variantes no pueden repetirse.');
  }
  const variantCombinations = variantsWithNormalizedColors.map(
    (variant) => `${variant.color.hex.trim().toUpperCase()}|${variant.size.trim().toLocaleLowerCase()}`,
  );
  if (variantCombinations.some((combination) => combination === '|')) {
    throw new Error('Cada variante debe tener al menos un color o un tamaño.');
  }
  if (new Set(variantCombinations).size !== variantCombinations.length) {
    throw new Error('No puede haber variantes con la misma combinación de color y tamaño.');
  }

  const referenceChecks = [
    data.categoryId
      ? categoryModel.exists({ _id: data.categoryId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } })
      : null,
    data.warehouseId
      ? getModel<Warehouse>(Collection.WAREHOUSES, WarehouseSchemaMongo).exists({ _id: data.warehouseId, organizationId })
      : null,
    data.contactId
      ? getModel<Contact>(Collection.CONTACTS, ContactSchemaMongo).exists({ _id: data.contactId, organizationId })
      : null,
    data.brand
      ? getModel<InventoryBrand>(Collection.BRANDS, BrandSchemaMongo).exists({ name: data.brand, organizationId })
      : null,
  ];
  const referenceResults = await Promise.all(referenceChecks.map((check) => check ?? Promise.resolve(true)));
  const referenceNames = ['categoría', 'almacén', 'proveedor', 'marca'];
  const invalidReferenceIndex = referenceResults.findIndex((result) => !result);
  if (invalidReferenceIndex >= 0) {
    throw new Error(`La ${referenceNames[invalidReferenceIndex]} seleccionada no pertenece a la organización.`);
  }

  const variants = variantsWithNormalizedColors.map((variant) => ({
    ...variant,
    id: variant.id ?? randomUUID(),
    stock: data.hasStock ? variant.stock : 0,
  }));
  const stock = data.hasStock
    ? variants.length > 0
      ? variants.reduce((total, variant) => total + variant.stock, 0)
      : (data.stock ?? 0)
    : 0;
  const price = data.price ?? 0;
  const taxRate = data.taxRate ?? 0;
  const customFields = (data.customFields ?? []).filter((field) => {
    const value = field.value;
    return value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0);
  });
  const baseSlug = slugify(data.name ?? '') || `product-${Date.now()}`;
  const existingSlugCount = await model.countDocuments({
    organizationId,
    slug: baseSlug,
    ...(productId ? { _id: { $ne: productId } } : {}),
  });
  return {
    ...data,
    customFields,
    slug: existingSlugCount > 0 ? `${baseSlug}-${existingSlugCount + 1}` : baseSlug,
    variants: variants.length > 0 ? variants : undefined,
    stock,
    stockState: data.hasStock && stock > 0 ? ProductStockState.InStock : ProductStockState.OutOfStock,
    total: price * (1 + taxRate / 100),
    taxes: taxRate > 0 ? [`Impuesto ${taxRate}%`] : [],
  };
};

export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  const model = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const product = new model(await prepareProductData(data));
  const createdProduct = await product.save();
  return createdProduct;
};
