import { useMemo } from 'react';
import { Button, Menus, useModal } from '@hlb/design-system';
import { ArrowLeft, Check, Library, PackageOpen, Plus, UploadIcon, X, XIcon } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PrivateRoutes } from '@/app/router/routes';
import { CatalogModal } from '@/modules/catalog/components/CatalogModal';
import { useCatalogs } from '@/modules/catalog/hooks';
import { usePriceLists } from '@/modules/inventary/price-lists/hooks';
import { useCreateProductModal, useDeleteProduct, useProduct, useUpdateProduct } from '../../hooks';
import styles from './ProductDetails.module.css';

const moneyFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const money = (value: number | undefined) => `${moneyFormatter.format(Number(value ?? 0))} CO$`;

const ProductDetails = () => {
  const { productId } = useParams();
  const { error, isLoading, product, refetch } = useProduct(productId);
  const { openEditProductModal } = useCreateProductModal();
  const { deleteProduct, isDeletingProduct } = useDeleteProduct();
  const { openModal, closeModal, requestCloseModal } = useModal();
  const { updateProduct, isUpdatingProduct } = useUpdateProduct(productId);
  const { catalogs } = useCatalogs();
  const { priceLists } = usePriceLists();
  const navigate = useNavigate();

  const productCatalogs = useMemo(
    () =>
      catalogs.filter(
        (catalog) =>
          catalog.selectionMode === 'all' ||
          catalog.productIds.map(String).includes(String(product?.id)),
      ),
    [catalogs, product?.id],
  );

  const productPriceLists = useMemo(
    () =>
      priceLists.filter((priceList) =>
        (product?.priceListIds ?? []).map(String).includes(String(priceList.id)),
      ),
    [priceLists, product?.priceListIds],
  );

  const openCatalogModal = () =>
    openModal(<CatalogModal closeModal={closeModal} onSuccess={() => refetch()} />, {
      id: 'create-catalog-from-product',
    });

  const confirmDelete = () => {
    if (!productId || isDeletingProduct) return;
    requestCloseModal({
      confirm: true,
      title: 'Eliminar producto',
      description: `El producto “${product?.name ?? 'Producto'}” dejará de estar disponible. ¿Deseas continuar?`,
      confirmLabel: 'Eliminar producto',
      cancelLabel: 'Cancelar',
      onConfirm: () =>
        deleteProduct(productId, { onSuccess: () => navigate(PrivateRoutes.PRODUCTS) }),
    });
  };

  const productName = product?.name ?? 'Producto';
  const initials =
    productName
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'PR';
  const stock = Number(product?.stock ?? 0);
  const price = Number(product?.price ?? 0);
  const purchasePrice = Number(product?.purchasePrice ?? 0);
  const cost = Number(product?.cost ?? 0);
  const taxLabel = product?.taxes?.[0] ?? 'Impuesto sobre las ventas 20%';
  const taxRate = Number(product?.taxRate ?? 0);
  const saleTax = (price * taxRate) / 100;
  const saleTotal = price + saleTax;
  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
  const variants = product?.variants ?? [];
  const maxVariantStock = Math.max(1, ...variants.map((variant) => Number(variant.stock ?? 0)));
  const availability = [
    ['forSale', 'Disponible para venta'],
    ['forPurchase', 'Disponible para compra'],
    ['inPos', 'Disponible en punto de venta'],
    ['inCatalog', 'Mostrar en catálogo'],
  ] as const;

  if (error) {
    return (
      <main className={styles.page}>
        <Link
          to={PrivateRoutes.PRODUCTS}
          className={styles.backIcon}
          aria-label="Volver a productos"
        >
          <ArrowLeft size={17} />
        </Link>
        <section className={styles.feedback}>
          <strong>No pudimos cargar este producto.</strong>
          <Button theme="optional" variant="outline" size="medium" onClick={() => refetch()}>
            Reintentar
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <Link
            to={PrivateRoutes.PRODUCTS}
            className={styles.backIcon}
            aria-label="Volver a productos"
          >
            <ArrowLeft size={17} />
          </Link>
          <span className={styles.avatar}>{initials}</span>
          <h1>{isLoading ? 'Cargando producto...' : productName}</h1>
        </div>

        <div className={styles.headerActions}>
          <Menus defaultPlacement="bottom-end">
            <Menus.Menu>
              <Menus.Toggle
                id="product-detail-actions"
                className={styles.menuToggle}
                verticalIcon
                aria-label="Más acciones"
              />
              <Menus.List id="product-detail-actions" placement="bottom-end">
                <Menus.Item
                  id="edit-product"
                  disabled={!productId}
                  onClick={() =>
                    productId && openEditProductModal(productId, { onSuccess: refetch })
                  }
                >
                  Editar
                </Menus.Item>
                <Menus.Item id="delete-product" danger onClick={confirmDelete}>
                  Eliminar
                </Menus.Item>
              </Menus.List>
            </Menus.Menu>
          </Menus>
          <Button
            theme="optional"
            variant="outline"
            size="medium"
            icon={<PackageOpen size={16} />}
            disabled={!productId}
            onClick={() => productId && openEditProductModal(productId, { onSuccess: refetch })}
          >
            Actualizar stock
          </Button>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.priceSummary}>
            <div>
              <span>Precio</span>
              <strong>{money(price)}</strong>
            </div>
            <div>
              <span>Precio de compra</span>
              <strong>{money(purchasePrice)}</strong>
            </div>
            <div>
              <span>Costo</span>
              <strong>{money(cost)}</strong>
            </div>
          </div>

          <div className={styles.metaBlock}>
            <span>Impuestos</span>
            <strong>{taxLabel}</strong>
            <span>Suministrar</span>
            <strong>{product?.forPurchase ? 'Comprado' : 'No definido'}</strong>
          </div>

          <section className={styles.sidebarSection}>
            <div className={styles.catalogRow}>
              <span>
                <Library size={17} />
              </span>
              <strong>Catálogo B2B</strong>
            </div>
            {productCatalogs.length > 0 ? (
              <ul className={styles.catalogList}>
                {productCatalogs.map((catalog) => (
                  <li key={String(catalog.id)} className={styles.catalogItem}>
                    <Link to={PrivateRoutes.CATALOG}>{catalog.name}</Link>
                    <span className={catalog.active ? styles.catalogBadge : styles.catalogBadgeOff}>
                      {catalog.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.catalogEmpty}>
                Este producto aún no pertenece a ningún catálogo.
              </p>
            )}
            <button type="button" className={styles.linkButton} onClick={openCatalogModal}>
              <Plus size={15} />
              {productCatalogs.length > 0 ? 'Añadir a un catálogo' : 'Crea tu primer catálogo'}
            </button>
          </section>

          <section className={styles.sidebarSection}>
            <div className={styles.posRow}>
              <span>TPV</span>
              <div>
                <strong>Punto de venta</strong>
                <p>Activa esta opción para mostrar este producto en tu app TPV.</p>
              </div>
              <button
                type="button"
                className={`${styles.switch} ${product?.inPos ? styles.switchActive : ''}`}
                aria-label={product?.inPos ? 'Desactivar punto de venta' : 'Activar punto de venta'}
                aria-pressed={Boolean(product?.inPos)}
                disabled={isUpdatingProduct || !product}
                onClick={() =>
                  updateProduct({ inPos: !product?.inPos }, { onSuccess: () => refetch() })
                }
              />
            </div>
          </section>

          <section className={styles.sidebarSection}>
            <span className={styles.sectionLabel}>Imágenes</span>

            <div className={styles.thumbnails}>
              {product?.images.slice(1).map((image, index) => (
                <div className={styles.thumbnail} key={`${image}-${index}`}>
                  <img src={image} alt={`Imagen adicional ${index + 1} del producto`} />
                  <button
                    className={styles.removeButton}
                    type="button"
                    aria-label={`Quitar imagen adicional ${index + 1}`}
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ))}

              <button
                className={`${styles.addButton}`}
                type="button"
                onDragOver={(event) => event.preventDefault()}
                aria-label="Agregar imágenes"
              >
                <UploadIcon size={25} />
              </button>
            </div>
          </section>
        </aside>

        <section className={styles.content}>
          <h2>Resumen</h2>
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span>
                <Check size={17} />
              </span>
              <div>
                <h3>Stock Total</h3>
                <strong>{stock} Unidades</strong>
                <p>Stock virtual {stock} Unidades</p>
                <p>Stock disponible {stock} Unidades</p>
              </div>
            </article>
            <article className={styles.summaryCard}>
              <span>
                <PackageOpen size={17} />
              </span>
              <div>
                <h3>Variantes</h3>
                <strong>{variants.length}</strong>
                <p>
                  {variants.length > 0
                    ? variants
                        .map((variant) => variant.name)
                        .slice(0, 3)
                        .join(', ')
                    : 'Sin variantes definidas'}
                </p>
              </div>
            </article>
            <article className={styles.summaryCard}>
              <span>
                <Check size={17} />
              </span>
              <div>
                <h3>Disponibilidad</h3>
                {availability.map(([key, label]) => (
                  <p key={key} className={styles.availabilityRow}>
                    {product?.[key] ? <Check size={14} /> : <X size={14} />}
                    <span>{label}</span>
                  </p>
                ))}
              </div>
            </article>
          </div>

          <section className={styles.chartSection}>
            <h3>Stock por variante</h3>
            {variants.length > 0 ? (
              <div className={styles.variantBars}>
                {variants.map((variant, index) => {
                  const variantStock = Number(variant.stock ?? 0);
                  const width = Math.max(2, (variantStock / maxVariantStock) * 100);
                  return (
                    <div className={styles.variantBarRow} key={variant.id ?? index}>
                      <span className={styles.variantName}>
                        {variant.name ||
                          `${variant.color?.name ?? ''} ${variant.size ?? ''}`.trim() ||
                          `Variante ${index + 1}`}
                      </span>
                      <div className={styles.variantTrack}>
                        <div className={styles.variantFill} style={{ width: `${width}%` }} />
                      </div>
                      <strong className={styles.variantStock}>{variantStock} uds</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.catalogEmpty}>
                Este producto no tiene variantes. Stock total: {stock} unidades.
              </p>
            )}
          </section>

          <section className={styles.priceList}>
            <div className={styles.sectionHeading}>
              <h2>Lista de precios de venta</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tarifa</th>
                  <th>Subtotal</th>
                  <th>Impuestos</th>
                  <th>Total</th>
                  <th>Margen</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Precio principal</td>
                  <td>{money(price)}</td>
                  <td>{money(saleTax)}</td>
                  <td>{money(saleTotal)}</td>
                  <td>{margin.toFixed(2)}%</td>
                </tr>
                {productPriceLists.map((priceList) => (
                  <tr key={String(priceList.id)}>
                    <td>
                      {priceList.name}
                      <span className={styles.tariffBadge}>{priceList.currency || 'COP'}</span>
                    </td>
                    <td>{money(price)}</td>
                    <td>{money(saleTax)}</td>
                    <td>{money(saleTotal)}</td>
                    <td>{margin.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={styles.priceList}>
            <div className={styles.sectionHeading}>
              <h2>Lista de precios de compra</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Tarifa</th>
                  <th>Subtotal</th>
                  <th>Impuestos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Precio principal</td>
                  <td>{money(purchasePrice)}</td>
                  <td>{money(0)}</td>
                  <td>{money(purchasePrice)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        </section>
      </div>
    </main>
  );
};

export default ProductDetails;
