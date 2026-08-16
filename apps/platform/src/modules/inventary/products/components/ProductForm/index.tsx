import { useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Button, TextInput } from '@hlb/design-system';
import { List, Search, Trash2 } from 'lucide-react';
import { useCreateProduct } from '../../hooks';
import { useBrands } from '@/modules/inventary/brands/hooks';
import { useCategories } from '@/modules/inventary/categories/hooks';
import { useWarehouses } from '@/modules/inventary/warehouses/hooks';
import { useContacts } from '@/modules/contacts/hooks';
import { useProductFieldDefinitions } from '@/modules/inventary/product-field-definitions';
import { SETTINGS_PRODUCT_FIELDS_HASH } from '@/modules/settings/hooks';
import { ImageUploader } from '@/modules/media/components';
import type { CreateProductPayload } from '../../services';
import type { CategoryId, ProductFieldValue, WarehouseId } from '@hlb/contracts';
import styles from './ProductForm.module.css';

export const PRODUCT_FORM_ID = 'product-form';

type ProductFormProps = {
  onDirtyChange?: (dirty: boolean) => void;
  onCancel: () => void;
  onSuccess?: () => void;
};

type ProductFormState = {
  name: string;
  description: string;
  tags: string;
  category: string;
  brand: string;
  salePrice: string;
  taxRate: string;
  purchasePrice: string;
  cost: string;
  supplier: string;
  sku: string;
  barcode: string;
  factoryCode: string;
  weight: string;
  warehouse: string;
  stock: string;
  salesAccount: string;
  purchaseAccount: string;
  addVariants: boolean;
  manageLots: boolean;
  manageSerials: boolean;
  manageStock: boolean;
  manufactured: boolean;
  forSale: boolean;
  forPurchase: boolean;
  inCatalog: boolean;
};

type VariantFormState = {
  id: string;
  color: string;
  size: string;
  price: string;
  purchasePrice: string;
  weight: string;
  sku: string;
  barcode: string;
  factoryCode: string;
  cost: string;
  stock: string;
};

const PRODUCT_COLORS = [
  { name: 'Negro', hex: '#000000' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Marfil', hex: '#FFFFF0' },
  { name: 'Crema', hex: '#FFFDD0' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Gris claro', hex: '#D1D5DB' },
  { name: 'Gris oscuro', hex: '#374151' },
  { name: 'Plateado', hex: '#C0C0C0' },
  { name: 'Rojo', hex: '#DC2626' },
  { name: 'Rojo oscuro', hex: '#991B1B' },
  { name: 'Burdeos', hex: '#800020' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Salmón', hex: '#FA8072' },
  { name: 'Naranja', hex: '#F97316' },
  { name: 'Terracota', hex: '#C65D3B' },
  { name: 'Amarillo', hex: '#FACC15' },
  { name: 'Mostaza', hex: '#D4A017' },
  { name: 'Dorado', hex: '#D4AF37' },
  { name: 'Verde', hex: '#16A34A' },
  { name: 'Verde claro', hex: '#86EFAC' },
  { name: 'Verde lima', hex: '#84CC16' },
  { name: 'Verde oliva', hex: '#808000' },
  { name: 'Verde militar', hex: '#4B5320' },
  { name: 'Verde menta', hex: '#98FF98' },
  { name: 'Esmeralda', hex: '#059669' },
  { name: 'Turquesa', hex: '#40E0D0' },
  { name: 'Aguamarina', hex: '#7FFFD4' },
  { name: 'Cian', hex: '#06B6D4' },
  { name: 'Azul', hex: '#2563EB' },
  { name: 'Azul claro', hex: '#60A5FA' },
  { name: 'Azul cielo', hex: '#87CEEB' },
  { name: 'Azul marino', hex: '#000080' },
  { name: 'Azul petróleo', hex: '#006D77' },
  { name: 'Índigo', hex: '#4F46E5' },
  { name: 'Morado', hex: '#9333EA' },
  { name: 'Violeta', hex: '#8B5CF6' },
  { name: 'Lavanda', hex: '#E6E6FA' },
  { name: 'Lila', hex: '#C8A2C8' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Rosa claro', hex: '#F9A8D4' },
  { name: 'Fucsia', hex: '#D946EF' },
  { name: 'Marrón', hex: '#92400E' },
  { name: 'Chocolate', hex: '#7B3F00' },
  { name: 'Café', hex: '#6F4E37' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Caqui', hex: '#C3B091' },
] as const;

const PRODUCT_STOCK_STATE = { outOfStock: 0, inStock: 1 } as const;

const getColorName = (hex: string) => PRODUCT_COLORS.find((color) => color.hex === hex)?.name ?? '';

type ColorSelectProps = {
  value: string;
  disabled?: boolean;
  label: string;
  onChange: (hex: string) => void;
};

const ColorSelect = ({ value, disabled, label, onChange }: ColorSelectProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const selectedColor = PRODUCT_COLORS.find((color) => color.hex === value);

  const toggleOptions = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuStyle({
        position: 'fixed',
        zIndex: 10000,
        left: rect.left,
        bottom: window.innerHeight - rect.top + 4,
        top: 'auto',
        width: Math.max(rect.width, 190),
        maxHeight: Math.max(120, Math.min(320, rect.top - 16)),
      });
    }

    setIsOpen((current) => !current);
  };

  return (
    <div className={styles.colorSelect}>
      <button
        ref={buttonRef}
        className={styles.colorSelectButton}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleOptions}
      >
        {selectedColor ? (
          <>
            <span className={styles.colorSwatch} style={{ backgroundColor: selectedColor.hex }} />
            <span>{selectedColor.name}</span>
          </>
        ) : (
          <span className={styles.colorPlaceholder}>Seleccionar</span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <>
            <div className={styles.colorSelectOverlay} onMouseDown={() => setIsOpen(false)} />
            <div
              className={styles.colorOptions}
              style={menuStyle}
              role="listbox"
              aria-label="Colores disponibles"
            >
              {PRODUCT_COLORS.map((color) => (
                <button
                  className={styles.colorOption}
                  type="button"
                  role="option"
                  aria-selected={color.hex === value}
                  key={color.hex}
                  onClick={() => {
                    onChange(color.hex);
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.colorSwatch} style={{ backgroundColor: color.hex }} />
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

const initialState: ProductFormState = {
  name: '',
  description: '',
  tags: '',
  category: '',
  brand: '',
  salePrice: '0',
  taxRate: '0',
  purchasePrice: '0',
  cost: '0',
  supplier: '',
  sku: '',
  barcode: '',
  factoryCode: '',
  weight: '0',
  warehouse: '',
  stock: '0',
  salesAccount: '',
  purchaseAccount: '',
  addVariants: false,
  manageLots: false,
  manageSerials: false,
  manageStock: true,
  manufactured: false,
  forSale: true,
  forPurchase: true,
  inCatalog: false,
};

const toNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const isValidNonNegativeNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return value.trim() !== '' && Number.isFinite(parsed) && parsed >= 0;
};

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const createVariant = (form: ProductFormState): VariantFormState => ({
  id: crypto.randomUUID(),
  color: '',
  size: '',
  price: form.salePrice,
  purchasePrice: form.purchasePrice,
  weight: form.weight,
  sku: form.sku,
  barcode: form.barcode,
  factoryCode: form.factoryCode,
  cost: form.cost,
  stock: form.stock,
});

export const ProductForm = ({ onCancel, onDirtyChange, onSuccess }: ProductFormProps) => {
  const [formState, setFormState] = useState<ProductFormState>(initialState);
  const [variants, setVariants] = useState<VariantFormState[]>([]);
  const [variantSearch, setVariantSearch] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, ProductFieldValue>>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createProduct, isCreatingProduct } = useCreateProduct();
  const { categories, isLoading: isLoadingCategories } = useCategories({ page: 1, limit: 100, search: '' });
  const { brands, isLoading: isLoadingBrands } = useBrands({ page: 1, limit: 100, search: '' });
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses({ page: 1, limit: 100, search: '' });
  const { contacts: suppliers, isLoading: isLoadingSuppliers } = useContacts({
    page: 1,
    limit: 100,
    search: '',
    scope: 'companies',
  });
  const { definitions: customFieldDefinitions, isLoadingDefinitions } = useProductFieldDefinitions({
    categoryId: (formState.category || undefined) as CategoryId | undefined,
  });

  const setDirty = () => onDirtyChange?.(true);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setError(null);
    setDirty();
  };

  const updateCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: checked,
      ...(name === 'addVariants' && checked ? { manageLots: false, manageSerials: false } : {}),
      ...(name === 'manageLots' && checked ? { addVariants: false, manageSerials: false } : {}),
      ...(name === 'manageSerials' && checked ? { addVariants: false, manageLots: false } : {}),
      ...(name === 'manageStock' && !checked ? { manageLots: false, manageSerials: false } : {}),
    }));

    if (name === 'addVariants' && checked && variants.length === 0) {
      setVariants([createVariant(formState)]);
    }
    if ((name === 'manageLots' || name === 'manageSerials') && checked) setVariants([]);

    setDirty();
  };

  const updateVariant = (variantId: string, field: keyof Omit<VariantFormState, 'id'>, value: string) => {
    setVariants((current) =>
      current.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)),
    );
    setDirty();
  };

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      { ...createVariant(formState), sku: '', barcode: '' },
    ]);
    setVariantSearch('');
    setDirty();
  };

  const removeVariant = (variantId: string) => {
    setVariants((current) => current.filter((variant) => variant.id !== variantId));
    setDirty();
  };

  const updateCustomField = (definitionId: string, value: ProductFieldValue) => {
    setCustomFieldValues((current) => ({ ...current, [definitionId]: value }));
    setError(null);
    setDirty();
  };

  const visibleVariants = variants.filter((variant) => {
    const search = variantSearch.trim().toLocaleLowerCase();
    if (!search) return true;

    return [variant.color, getColorName(variant.color), variant.size].some((value) =>
      value.toLocaleLowerCase().includes(search),
    );
  });

  const buildPayload = (): CreateProductPayload => {
    const price = toNumber(formState.salePrice);
    const tags = splitList(formState.tags);
    const selectedCategory = categories.find((category) => String(category.id) === formState.category);
    const selectedSupplier = suppliers.find((supplier) => String(supplier.id) === formState.supplier);
    const taxRate = toNumber(formState.taxRate);
    const productStock = formState.addVariants
      ? variants.reduce((total, variant) => total + toNumber(variant.stock), 0)
      : toNumber(formState.stock);
    const customFields = customFieldDefinitions.flatMap((definition) => {
      const value = customFieldValues[String(definition.id)] ?? definition.defaultValue;
      const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
      return isEmpty ? [] : [{ definitionId: definition.id, value }];
    });

    return {
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      images: imageUrls,
      tags,
      brand: formState.brand || undefined,
      categoryId: (formState.category || undefined) as CategoryId | undefined,
      categories: selectedCategory ? [selectedCategory.name] : undefined,
      customFields,
      price,
      total: price * (1 + taxRate / 100),
      taxRate,
      purchasePrice: toNumber(formState.purchasePrice),
      cost: toNumber(formState.cost),
      sku: formState.sku.trim() || undefined,
      barcode: formState.barcode.trim() || undefined,
      factoryCode: formState.factoryCode.trim() || undefined,
      weight: toNumber(formState.weight),
      stock: formState.manageStock ? productStock : 0,
      hasStock: formState.manageStock,
      stockState: formState.manageStock && productStock > 0
        ? PRODUCT_STOCK_STATE.inStock
        : PRODUCT_STOCK_STATE.outOfStock,
      warehouseId: (formState.warehouse || undefined) as WarehouseId | undefined,
      taxes: taxRate > 0 ? [`Impuesto ${taxRate}%`] : [],
      forSale: formState.forSale,
      forPurchase: formState.forPurchase,
      forProduction: formState.manufactured,
      inCatalog: formState.inCatalog,
      contactId: selectedSupplier?.id,
      contactName: selectedSupplier?.name,
      manageLots: formState.manageLots,
      manageSerials: formState.manageSerials,
      salesAccountId: formState.salesAccount.trim() || undefined,
      purchaseAccountId: formState.purchaseAccount.trim() || undefined,
      kind: 'physical',
      variants: formState.addVariants
        ? variants.map((variant, index) => ({
            name:
              [formState.name.trim(), variant.color.trim(), variant.size.trim()].filter(Boolean).join(' - ') ||
              `Variante ${index + 1}`,
            sku: variant.sku.trim(),
            barcode: variant.barcode.trim(),
            factoryCode: variant.factoryCode.trim(),
            price: toNumber(variant.price),
            cost: toNumber(variant.cost),
            purchasePrice: toNumber(variant.purchasePrice),
            weight: toNumber(variant.weight),
            stock: formState.manageStock ? toNumber(variant.stock) : 0,
            color: variant.color.trim(),
            size: variant.size.trim(),
          }))
        : undefined,
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      setError('Ingresa el nombre del producto.');
      return;
    }

    if (isUploadingImage) {
      setError('Espera a que termine de subir la imagen.');
      return;
    }

    if (formState.addVariants && variants.length === 0) {
      setError('Agrega al menos una variante al producto.');
      return;
    }
    if (formState.manageStock && !formState.warehouse) {
      setError('Selecciona un almacén para gestionar el stock.');
      return;
    }
    if (formState.addVariants && variants.some((variant) => !variant.color && !variant.size.trim())) {
      setError('Cada variante debe tener al menos un color o un tamaño.');
      return;
    }
    const variantCombinations = variants.map((variant) => `${variant.color}|${variant.size.trim().toLowerCase()}`);
    if (formState.addVariants && new Set(variantCombinations).size !== variantCombinations.length) {
      setError('No puede haber dos variantes con la misma combinación de color y tamaño.');
      return;
    }

    const numericFields = [
      ['Precio de venta', formState.salePrice],
      ['Impuesto', formState.taxRate],
      ['Precio de compra', formState.purchasePrice],
      ['Coste medio', formState.cost],
      ['Peso', formState.weight],
      ['Cantidad', formState.stock],
    ] as const;
    const invalidNumericField = numericFields.find(([, value]) => !isValidNonNegativeNumber(value));
    if (invalidNumericField || toNumber(formState.taxRate) > 100) {
      setError(
        toNumber(formState.taxRate) > 100
          ? 'El impuesto debe estar entre 0 y 100.'
          : `El campo “${invalidNumericField?.[0]}” debe ser un número igual o mayor que cero.`,
      );
      return;
    }

    const invalidVariant = variants.find((variant) =>
      [variant.price, variant.purchasePrice, variant.cost, variant.weight, variant.stock].some(
        (value) => !isValidNonNegativeNumber(value),
      ),
    );
    if (formState.addVariants && invalidVariant) {
      setError('Todos los precios, costes, pesos y cantidades de las variantes deben ser números válidos.');
      return;
    }

    const missingRequiredField = customFieldDefinitions.find((definition) => {
      if (!definition.required) return false;
      const value = customFieldValues[String(definition.id)] ?? definition.defaultValue;
      return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
    });

    if (missingRequiredField) {
      setError(`Completa el campo personalizado “${missingRequiredField.label}”.`);
      return;
    }

    createProduct(buildPayload(), {
      onSuccess: () => {
        onDirtyChange?.(false);
        onSuccess?.();
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'No pudimos crear el producto.');
      },
    });
  };

  return (
    <form id={PRODUCT_FORM_ID} className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.content}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <h3>Información básica</h3>
            <p>Describe tu producto. Puedes utilizar esta información en los documentos que generes.</p>
            <TextInput
              label="Nombre del producto *"
              placeholder="Añade un nombre a tu producto"
              name="name"
              value={formState.name}
              error={error ?? undefined}
              disabled={isCreatingProduct}
              autoFocus
              onChange={updateField}
            />
            <label className={styles.textareaField}>
              <span>Descripción</span>
              <textarea
                name="description"
                placeholder="Especifica las características del artículo"
                value={formState.description}
                disabled={isCreatingProduct}
                onChange={updateField}
              />
            </label>
            <button type="button" className={styles.linkButton} disabled title="Disponible próximamente">
              + Añadir traducción
            </button>
          </section>

          {(isLoadingDefinitions || customFieldDefinitions.length > 0) && (
            <section className={styles.card}>
              <h3>Información personalizada</h3>
              <p>Campos configurados por tu organización para este tipo de producto.</p>
              {isLoadingDefinitions ? (
                <p>Cargando campos personalizados...</p>
              ) : (
                <div className={styles.customFieldsGrid}>
                  {customFieldDefinitions.map((definition) => {
                    const definitionId = String(definition.id);
                    const value = customFieldValues[definitionId] ?? definition.defaultValue;
                    const label = `${definition.label}${definition.required ? ' *' : ''}`;

                    if (definition.type === 'long-text') {
                      return (
                        <label className={`${styles.textareaField} ${styles.fullWidthField}`} key={definitionId}>
                          <span>{label}</span>
                          <textarea
                            value={typeof value === 'string' ? value : ''}
                            disabled={isCreatingProduct}
                            onChange={(event) => updateCustomField(definitionId, event.target.value)}
                          />
                        </label>
                      );
                    }

                    if (definition.type === 'select') {
                      return (
                        <label className={styles.selectField} key={definitionId}>
                          <span>{label}</span>
                          <select
                            value={typeof value === 'string' ? value : ''}
                            disabled={isCreatingProduct}
                            onChange={(event) => updateCustomField(definitionId, event.target.value)}
                          >
                            <option value="">Seleccionar</option>
                            {definition.options.map((option) => (
                              <option value={option.value} key={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      );
                    }

                    if (definition.type === 'multi-select') {
                      const selectedValues = Array.isArray(value) ? value : [];
                      return (
                        <fieldset className={styles.customMultiSelect} key={definitionId}>
                          <legend>{label}</legend>
                          {definition.options.map((option) => (
                            <label className={styles.checkboxField} key={option.value}>
                              <input
                                type="checkbox"
                                checked={selectedValues.includes(option.value)}
                                disabled={isCreatingProduct}
                                onChange={(event) =>
                                  updateCustomField(
                                    definitionId,
                                    event.target.checked
                                      ? [...selectedValues, option.value]
                                      : selectedValues.filter((item) => item !== option.value),
                                  )
                                }
                              />
                              {option.label}
                            </label>
                          ))}
                        </fieldset>
                      );
                    }

                    if (definition.type === 'boolean') {
                      return (
                        <label className={styles.checkboxField} key={definitionId}>
                          <input
                            type="checkbox"
                            checked={value === true}
                            disabled={isCreatingProduct}
                            onChange={(event) => updateCustomField(definitionId, event.target.checked)}
                          />
                          {label}
                        </label>
                      );
                    }

                    return (
                      <TextInput
                        key={definitionId}
                        label={label}
                        type={definition.type === 'number' ? 'number' : definition.type === 'date' ? 'date' : 'text'}
                        value={value === null || value === undefined ? '' : String(value)}
                        disabled={isCreatingProduct}
                        onChange={(event) =>
                          updateCustomField(
                            definitionId,
                            definition.type === 'number' ? toNumber(event.target.value) : event.target.value,
                          )
                        }
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <section className={styles.card}>
            <h3>Ventas</h3>
            <p>Indica el subtotal y el impuesto aplicable. El importe total se calculará de forma automática.</p>
            <div className={styles.priceTable}>
              <div className={styles.tableHeader}>
                <span>Nombre</span>
                <span>Subtotal</span>
                <span>Impuestos</span>
                <span>Total</span>
              </div>
              <div className={styles.tableRow}>
                <span>Tarifa principal</span>
                <label className={styles.amountInput}>
                  <input
                    name="salePrice"
                    value={formState.salePrice}
                    disabled={isCreatingProduct}
                    onChange={updateField}
                  />
                  <b>COP</b>
                </label>
                <label className={styles.amountInput}>
                  <input
                    name="taxRate"
                    inputMode="decimal"
                    value={formState.taxRate}
                    disabled={isCreatingProduct}
                    aria-label="Porcentaje de impuesto"
                    onChange={updateField}
                  />
                  <b>%</b>
                </label>
                <label className={styles.amountInput}>
                  <input
                    value={(toNumber(formState.salePrice) * (1 + toNumber(formState.taxRate) / 100)).toFixed(2)}
                    disabled
                    readOnly
                  />
                </label>
              </div>
              <button type="button" className={styles.linkButton} disabled title="Disponible próximamente">
                Gestionar tarifas
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <h3>Compras y fabricación</h3>
            <p>
              Indica si es un producto fabricado, define su coste medio para informes y su precio de compra
              o fabricación para documentos.
            </p>
            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                name="manufactured"
                checked={formState.manufactured}
                disabled={isCreatingProduct}
                onChange={updateCheckbox}
              />
              Es un producto fabricado
            </label>
            <div className={styles.twoColumns}>
              <label className={styles.amountInput}>
                <span>Coste medio</span>
                <input name="cost" value={formState.cost} disabled={isCreatingProduct} onChange={updateField} />
                <b>COP</b>
              </label>
              <label className={styles.selectField}>
                <span>Proveedor por defecto</span>
                <select
                  name="supplier"
                  value={formState.supplier}
                  disabled={isCreatingProduct || isLoadingSuppliers}
                  onChange={updateField}
                >
                  <option value="">{isLoadingSuppliers ? 'Cargando proveedores...' : 'Selecciona un proveedor'}</option>
                  {suppliers.map((supplier) => (
                    <option value={String(supplier.id)} key={String(supplier.id)}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className={styles.priceTable}>
              <div className={styles.tableHeader}>
                <span>Nombre</span>
                <span>Cód. fabricación</span>
                <span>Subtotal</span>
                <span>Impuestos</span>
              </div>
              <div className={styles.tableRow}>
                <span>Precio compra</span>
                <input name="factoryCode" value={formState.factoryCode} disabled={isCreatingProduct} onChange={updateField} />
                <label className={styles.amountInput}>
                  <input
                    name="purchasePrice"
                    value={formState.purchasePrice}
                    disabled={isCreatingProduct}
                    onChange={updateField}
                  />
                  <b>COP</b>
                </label>
                <span className={styles.taxPill}>{toNumber(formState.taxRate)}%</span>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h3>Seguimiento</h3>
            <p>Introduce la información que identifique el producto</p>
            <div className={styles.twoColumns}>
              <TextInput label="SKU" name="sku" value={formState.sku} disabled={isCreatingProduct} onChange={updateField} />
              <TextInput
                label="Código de barras"
                name="barcode"
                value={formState.barcode}
                disabled={isCreatingProduct}
                onChange={updateField}
              />
              <TextInput
                label="Código de fabricación"
                name="factoryCode"
                value={formState.factoryCode}
                disabled={isCreatingProduct}
                onChange={updateField}
              />
              <label className={styles.amountInput}>
                <span>Peso</span>
                <input name="weight" value={formState.weight} disabled={isCreatingProduct} onChange={updateField} />
                <b>kg</b>
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <h3>Gestión de stock</h3>
            <p>Elige si deseas hacer seguimiento del stock y define tu almacén predeterminado.</p>
            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                name="manageStock"
                checked={formState.manageStock}
                disabled={isCreatingProduct}
                onChange={updateCheckbox}
              />
              Gestionar stock
            </label>
            <div className={styles.twoColumns}>
              <label className={styles.selectField}>
                <span>Almacén predeterminado</span>
                <select
                  name="warehouse"
                  value={formState.warehouse}
                  disabled={isCreatingProduct || isLoadingWarehouses}
                  onChange={updateField}
                >
                  <option value="">
                    {isLoadingWarehouses ? 'Cargando almacenes...' : 'Selecciona un almacén'}
                  </option>
                  {warehouses.map((warehouse) => (
                    <option key={String(warehouse.id ?? warehouse.name)} value={String(warehouse.id ?? '')}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.amountInput}>
                <span>Cantidad</span>
                <input
                  name="stock"
                  value={formState.stock}
                  disabled={isCreatingProduct || !formState.manageStock || formState.addVariants}
                  onChange={updateField}
                />
                <b>unidades</b>
              </label>
            </div>
          </section>

          <section className={styles.card}>
            <h3>Opciones</h3>
            <p>
              Añade variantes al producto o activa la gestión de lotes y números de serie. Un producto con
              variantes no podrá incluir lotes o números de serie.
            </p>
            {[
              ['addVariants', 'Añadir variantes'],
              ['manageLots', 'Gestionar lotes'],
              ['manageSerials', 'Gestionar números de serie'],
            ].map(([name, label]) => (
              <label key={name} className={styles.checkboxField}>
                <input
                  type="checkbox"
                  name={name}
                  checked={Boolean(formState[name as keyof ProductFormState])}
                  disabled={
                    isCreatingProduct ||
                    ((name === 'manageLots' || name === 'manageSerials') &&
                      (formState.addVariants || !formState.manageStock))
                  }
                  onChange={updateCheckbox}
                />
                {label}
              </label>
            ))}
          </section>

          {formState.addVariants && (
            <section className={styles.card}>
              <h3>Variantes</h3>
              <p>Edita la información de las variantes, precios de venta y compra.</p>
              <div className={styles.variantPanel}>
                <div className={styles.variantToolbar}>
                  <Button type="button" theme="optional" variant="outline" size="medium" disabled>
                    Precios de venta
                  </Button>
                  <Button type="button" theme="optional" variant="outline" size="medium" disabled>
                    Precios de compra
                  </Button>
                  <label className={styles.variantSearch}>
                    <Search size={17} />
                    <input
                      value={variantSearch}
                      placeholder="Buscar por color o tamaño"
                      disabled={isCreatingProduct}
                      onChange={(event) => setVariantSearch(event.target.value)}
                    />
                  </label>
                  <List size={20} aria-hidden="true" />
                </div>

                <div className={styles.variantTableScroll}>
                  <table className={styles.variantTable}>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Cód. barras</th>
                        <th>Cód. fábrica</th>
                        <th>Color</th>
                        <th>Tamaño</th>
                        <th>Precio venta</th>
                        <th>Precio compra</th>
                        <th>Coste</th>
                        <th>Peso</th>
                        <th>Stock</th>
                        <th aria-label="Acciones" />
                      </tr>
                    </thead>
                    <tbody>
                      {visibleVariants.map((variant) => {
                        const variantIndex = variants.findIndex((item) => item.id === variant.id);

                        return (
                          <tr key={variant.id}>
                            <td><input value={variant.sku} placeholder="SKU" disabled={isCreatingProduct} aria-label={`SKU de variante ${variantIndex + 1}`} onChange={(event) => updateVariant(variant.id, 'sku', event.target.value)} /></td>
                            <td><input value={variant.barcode} placeholder="Código" disabled={isCreatingProduct} aria-label={`Código de barras de variante ${variantIndex + 1}`} onChange={(event) => updateVariant(variant.id, 'barcode', event.target.value)} /></td>
                            <td><input value={variant.factoryCode} placeholder="Código" disabled={isCreatingProduct} aria-label={`Código de fabricación de variante ${variantIndex + 1}`} onChange={(event) => updateVariant(variant.id, 'factoryCode', event.target.value)} /></td>
                            <td>
                              <ColorSelect
                                value={variant.color}
                                disabled={isCreatingProduct}
                                label={`Color de variante ${variantIndex + 1}`}
                                onChange={(hex) => updateVariant(variant.id, 'color', hex)}
                              />
                            </td>
                            <td>
                              <input
                                value={variant.size}
                                placeholder="Tamaño"
                                disabled={isCreatingProduct}
                                aria-label={`Tamaño de variante ${variantIndex + 1}`}
                                onChange={(event) => updateVariant(variant.id, 'size', event.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                inputMode="decimal"
                                value={variant.price}
                                disabled={isCreatingProduct}
                                aria-label={`Precio de venta de variante ${variantIndex + 1}`}
                                onChange={(event) => updateVariant(variant.id, 'price', event.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                inputMode="decimal"
                                value={variant.purchasePrice}
                                disabled={isCreatingProduct}
                                aria-label={`Precio de compra de variante ${variantIndex + 1}`}
                                onChange={(event) => updateVariant(variant.id, 'purchasePrice', event.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                inputMode="decimal"
                                value={variant.cost}
                                disabled={isCreatingProduct}
                                aria-label={`Coste de variante ${variantIndex + 1}`}
                                onChange={(event) => updateVariant(variant.id, 'cost', event.target.value)}
                              />
                            </td>
                            <td>
                              <div className={styles.variantWeightInput}>
                                <input
                                  inputMode="decimal"
                                  value={variant.weight}
                                  disabled={isCreatingProduct}
                                  aria-label={`Peso de variante ${variantIndex + 1}`}
                                  onChange={(event) => updateVariant(variant.id, 'weight', event.target.value)}
                                />
                                <span>kg</span>
                              </div>
                            </td>
                            <td>
                              <input
                                inputMode="numeric"
                                value={variant.stock}
                                disabled={isCreatingProduct || !formState.manageStock}
                                aria-label={`Stock de variante ${variantIndex + 1}`}
                                onChange={(event) => updateVariant(variant.id, 'stock', event.target.value)}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className={styles.removeVariantButton}
                                disabled={isCreatingProduct}
                                onClick={() => removeVariant(variant.id)}
                                aria-label={`Eliminar variante ${variantIndex + 1}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {visibleVariants.length === 0 && (
                    <p className={styles.emptyVariants}>No hay variantes que coincidan con la búsqueda.</p>
                  )}
                </div>
                <button
                  type="button"
                  className={`${styles.linkButton} ${styles.addVariantButton}`}
                  disabled={isCreatingProduct}
                  onClick={addVariant}
                >
                  + Nueva variante
                </button>
              </div>
            </section>
          )}

          <section className={styles.card}>
            <h3>Disponibilidad</h3>
            <p>Define cómo puede utilizarse este producto.</p>
            {[
              ['forSale', 'Disponible para venta'],
              ['forPurchase', 'Disponible para compra'],
              ['inCatalog', 'Mostrar en catálogo'],
            ].map(([name, label]) => (
              <label className={styles.checkboxField} key={name}>
                <input
                  type="checkbox"
                  name={name}
                  checked={Boolean(formState[name as keyof ProductFormState])}
                  disabled={isCreatingProduct}
                  onChange={updateCheckbox}
                />
                {label}
              </label>
            ))}
          </section>

          <section className={styles.card}>
            <h3>Contabilidad</h3>
            <p>Define la cuenta contable predeterminada de ventas y compras para este producto.</p>
            <TextInput label="Cuenta de Ventas" placeholder="Código o nombre de cuenta" name="salesAccount" value={formState.salesAccount} disabled={isCreatingProduct} onChange={updateField} />
            <TextInput label="Cuenta de Compras" placeholder="Código o nombre de cuenta" name="purchaseAccount" value={formState.purchaseAccount} disabled={isCreatingProduct} onChange={updateField} />
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                window.location.hash = SETTINGS_PRODUCT_FIELDS_HASH;
              }}
            >
              + Administrar campos personalizados
            </button>
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.card}>
            <h3>Categorización</h3>
            <p>Incluye información adicional para completar tu ficha de producto.</p>
            <TextInput
              label="Etiquetas"
              placeholder="Busca o crea tags"
              name="tags"
              value={formState.tags}
              disabled={isCreatingProduct}
              onChange={updateField}
            />
            <label className={styles.selectField}>
              <span>Categorías</span>
              <select
                name="category"
                value={formState.category}
                disabled={isCreatingProduct || isLoadingCategories}
                onChange={updateField}
              >
                <option value="">
                  {isLoadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}
                </option>
                  {categories.map((category) => (
                    <option key={String(category.id ?? category.slug ?? category.name)} value={String(category.id)}>
                      {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Marca</span>
              <select
                name="brand"
                value={formState.brand}
                disabled={isCreatingProduct || isLoadingBrands}
                onChange={updateField}
              >
                <option value="">
                  {isLoadingBrands ? 'Cargando marcas...' : 'Selecciona una marca'}
                </option>
                {brands.map((brand) => (
                  <option key={String(brand.id ?? brand.slug ?? brand.name)} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className={styles.card}>
            <h3>Imagen del producto</h3>
            <p>
              Sube una imagen de tu producto. Podrás utilizarla en documentos y en el <strong>Catálogo</strong>.
            </p>
            <ImageUploader
              folder="products/images"
              value={imageUrls}
              disabled={isCreatingProduct}
              onUploadingChange={setIsUploadingImage}
              onChange={(images) => {
                setImageUrls(images);
                setError(null);
                setDirty();
              }}
            />
          </section>
        </aside>
      </div>

      <div className={styles.footer}>
        <Button
          type="button"
          theme="optional"
          variant="outline"
          disabled={isCreatingProduct || isUploadingImage}
          onClick={onCancel}
        >
          Descartar
        </Button>
        <Button
          form={PRODUCT_FORM_ID}
          type="submit"
          loading={isCreatingProduct || isUploadingImage}
          disabled={isUploadingImage}
        >
          Guardar
        </Button>
      </div>
    </form>
  );
};
