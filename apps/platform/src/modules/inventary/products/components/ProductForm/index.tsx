import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, TextInput } from '@hlb/design-system';
import { Trash2 } from 'lucide-react';
import { useCreateProduct } from '../../hooks';
import { useBrands } from '@/modules/inventary/brands/hooks';
import { useCategories } from '@/modules/inventary/categories/hooks';
import { useWarehouses } from '@/modules/inventary/warehouses/hooks';
import { ImageUploader } from '@/modules/media/components';
import type { CreateProductPayload } from '../../services';
import type { WarehouseId } from '@hlb/contracts';
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
};

type VariantFormState = {
  id: string;
  color: string;
  size: string;
  price: string;
  purchasePrice: string;
};

const initialState: ProductFormState = {
  name: '',
  description: '',
  tags: '',
  category: '',
  brand: '',
  salePrice: '0',
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
};

const toNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const createVariant = (salePrice = '0', purchasePrice = '0'): VariantFormState => ({
  id: crypto.randomUUID(),
  color: '',
  size: '',
  price: salePrice,
  purchasePrice,
});

export const ProductForm = ({ onCancel, onDirtyChange, onSuccess }: ProductFormProps) => {
  const [formState, setFormState] = useState<ProductFormState>(initialState);
  const [variants, setVariants] = useState<VariantFormState[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createProduct, isCreatingProduct } = useCreateProduct();
  const { categories, isLoading: isLoadingCategories } = useCategories({ page: 1, limit: 100, search: '' });
  const { brands, isLoading: isLoadingBrands } = useBrands({ page: 1, limit: 100, search: '' });
  const { warehouses, isLoading: isLoadingWarehouses } = useWarehouses({ page: 1, limit: 100, search: '' });

  const setDirty = () => onDirtyChange?.(true);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setError(null);
    setDirty();
  };

  const updateCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = event.target;
    setFormState((current) => ({ ...current, [name]: checked }));

    if (name === 'addVariants' && checked && variants.length === 0) {
      setVariants([createVariant(formState.salePrice, formState.purchasePrice)]);
    }

    setDirty();
  };

  const updateVariant = (variantId: string, field: keyof Omit<VariantFormState, 'id'>, value: string) => {
    setVariants((current) =>
      current.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)),
    );
    setDirty();
  };

  const addVariant = () => {
    setVariants((current) => [...current, createVariant(formState.salePrice, formState.purchasePrice)]);
    setDirty();
  };

  const removeVariant = (variantId: string) => {
    setVariants((current) => current.filter((variant) => variant.id !== variantId));
    setDirty();
  };

  const buildPayload = (): CreateProductPayload => {
    const price = toNumber(formState.salePrice);
    const tags = splitList(formState.tags);

    return {
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      images: imageUrls,
      tags,
      brand: formState.brand || undefined,
      categories: formState.category ? [formState.category] : undefined,
      price,
      total: price,
      purchasePrice: toNumber(formState.purchasePrice),
      cost: toNumber(formState.cost),
      sku: formState.sku.trim() || undefined,
      barcode: formState.barcode.trim() || undefined,
      factoryCode: formState.factoryCode.trim() || undefined,
      weight: toNumber(formState.weight),
      stock: formState.manageStock ? toNumber(formState.stock) : 0,
      hasStock: formState.manageStock,
      warehouseId: (formState.warehouse || undefined) as WarehouseId | undefined,
      taxes: ['Impuesto sobre las ventas 20%'],
      forSale: true,
      forPurchase: true,
      variants: formState.addVariants
        ? variants.map((variant, index) => ({
            name:
              [formState.name.trim(), variant.color.trim(), variant.size.trim()].filter(Boolean).join(' - ') ||
              `Variante ${index + 1}`,
            sku: formState.sku.trim(),
            barcode: formState.barcode.trim(),
            factoryCode: formState.factoryCode.trim(),
            price: toNumber(variant.price),
            cost: toNumber(formState.cost),
            purchasePrice: toNumber(variant.purchasePrice),
            weight: toNumber(formState.weight),
            stock: formState.manageStock ? toNumber(formState.stock) : 0,
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
            <button type="button" className={styles.linkButton}>
              + Añadir traducción
            </button>
          </section>

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
                <span className={styles.taxPill}>.salestax 20% ×</span>
                <label className={styles.amountInput}>
                  <input value={formState.salePrice} disabled readOnly />
                </label>
              </div>
              <button type="button" className={styles.linkButton}>
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
              <TextInput
                label="Proveedor por defecto"
                placeholder="Busca y selecciona proveedores"
                name="supplier"
                value={formState.supplier}
                disabled={isCreatingProduct}
                onChange={updateField}
              />
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
                <span className={styles.taxPill}>.salestax 20% ×</span>
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
                <input name="stock" value={formState.stock} disabled={isCreatingProduct} onChange={updateField} />
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
                  disabled={isCreatingProduct}
                  onChange={updateCheckbox}
                />
                {label}
              </label>
            ))}
          </section>

          {formState.addVariants && (
            <section className={styles.card}>
              <h3>Variantes</h3>
              <p>Define las combinaciones de color y tamaño, junto con sus precios de venta y compra.</p>
              <div className={styles.variantList}>
                {variants.map((variant, index) => (
                  <article className={styles.variantCard} key={variant.id}>
                    <header className={styles.variantHeader}>
                      <strong>Variante {index + 1}</strong>
                      <button
                        type="button"
                        className={styles.removeVariantButton}
                        disabled={isCreatingProduct}
                        onClick={() => removeVariant(variant.id)}
                        aria-label={`Eliminar variante ${index + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </header>
                    <div className={styles.variantFields}>
                      <TextInput
                        label="Color"
                        placeholder="Ej. Azul"
                        value={variant.color}
                        disabled={isCreatingProduct}
                        onChange={(event) => updateVariant(variant.id, 'color', event.target.value)}
                      />
                      <TextInput
                        label="Tamaño"
                        placeholder="Ej. M, 38, 500 ml"
                        value={variant.size}
                        disabled={isCreatingProduct}
                        onChange={(event) => updateVariant(variant.id, 'size', event.target.value)}
                      />
                      <label className={styles.amountInput}>
                        <span>Precio de venta</span>
                        <input
                          inputMode="decimal"
                          value={variant.price}
                          disabled={isCreatingProduct}
                          onChange={(event) => updateVariant(variant.id, 'price', event.target.value)}
                        />
                        <b>COP</b>
                      </label>
                      <label className={styles.amountInput}>
                        <span>Precio de compra</span>
                        <input
                          inputMode="decimal"
                          value={variant.purchasePrice}
                          disabled={isCreatingProduct}
                          onChange={(event) => updateVariant(variant.id, 'purchasePrice', event.target.value)}
                        />
                        <b>COP</b>
                      </label>
                    </div>
                  </article>
                ))}
              </div>
              <button type="button" className={styles.linkButton} disabled={isCreatingProduct} onClick={addVariant}>
                + Nueva variante
              </button>
            </section>
          )}

          <section className={styles.card}>
            <h3>Contabilidad</h3>
            <p>Define la cuenta contable predeterminada de ventas y compras para este producto.</p>
            <label className={styles.selectField}>
              <span>Cuenta de Ventas</span>
              <select
                name="salesAccount"
                value={formState.salesAccount}
                disabled={isCreatingProduct}
                onChange={updateField}
              >
                <option value="">Selecciona una cuenta contable</option>
              </select>
            </label>
            <label className={styles.selectField}>
              <span>Cuenta de Compras</span>
              <select
                name="purchaseAccount"
                value={formState.purchaseAccount}
                disabled={isCreatingProduct}
                onChange={updateField}
              >
                <option value="">Selecciona una cuenta contable</option>
              </select>
            </label>
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
                  <option key={String(category.id ?? category.slug ?? category.name)} value={category.name}>
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
