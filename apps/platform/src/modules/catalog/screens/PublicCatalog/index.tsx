import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { PublicCatalog as PublicCatalogType, PublicCatalogProduct, PublicCatalogProductVariant } from '@hlb/contracts';
import styles from './PublicCatalog.module.css';

type CartLine = {
  key: string;
  product: PublicCatalogProduct;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
};

const apiBase = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const money = (value: number, currency: string) => new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
const variantOptionLabel = (productName: string, variant: PublicCatalogProductVariant) => {
  const attributes = [variant.color?.name, variant.size].filter(Boolean).join(' · ');
  if (attributes) return attributes;

  const normalizedProductName = productName.trim();
  const variantName = variant.name.trim();
  const nameWithoutProduct = variantName.toLocaleLowerCase().startsWith(normalizedProductName.toLocaleLowerCase())
    ? variantName.slice(normalizedProductName.length).replace(/^[\s\-–—·|:/]+/, '').trim()
    : variantName;
  return nameWithoutProduct || variant.sku || 'Variante';
};

const PublicCatalog = () => {
  const { publicId = '' } = useParams();
  const [catalog, setCatalog] = useState<PublicCatalogType | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`${apiBase}/public/catalogs/${encodeURIComponent(publicId)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? 'Este catálogo no está disponible.' : 'No pudimos cargar el catálogo.');
        return response.json() as Promise<PublicCatalogType>;
      })
      .then(setCatalog)
      .catch((requestError) => {
        if ((requestError as Error).name !== 'AbortError') setError((requestError as Error).message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [publicId]);

  const totalItems = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  const addProduct = (product: PublicCatalogProduct) => {
    const variantId = product.variants.length ? selectedVariants[product.id] : undefined;
    const variant = product.variants.find((item) => item.id === variantId);
    if (product.variants.length && !variant) {
      setError('Selecciona una variante antes de añadir el producto.');
      return;
    }
    if (!(variant?.available ?? product.available)) return;
    const key = `${product.id}:${variantId ?? ''}`;
    setCart((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) return current.map((line) => line.key === key ? { ...line, quantity: line.quantity + 1 } : line);
      return [...current, { key, product, variantId, variantName: variant?.name, unitPrice: Number(variant?.price ?? product.price ?? 0), quantity: 1 }];
    });
    setError('');
  };

  const changeQuantity = (key: string, difference: number) => setCart((current) => current.flatMap((line) => {
    if (line.key !== key) return [line];
    const quantity = line.quantity + difference;
    return quantity > 0 ? [{ ...line, quantity }] : [];
  }));

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length) return;
    const data = new FormData(event.currentTarget);
    setSending(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/public/catalogs/${encodeURIComponent(publicId)}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: data.get('name'), email: data.get('email'), phone: data.get('phone'),
            company: data.get('company'), notes: data.get('notes'),
          },
          items: cart.map((line) => ({ productId: line.product.id, variantId: line.variantId, quantity: line.quantity })),
        }),
      });
      const result = await response.json() as { orderNumber?: string; message?: string };
      if (!response.ok) throw new Error(result.message ?? 'No pudimos enviar el pedido.');
      setOrderNumber(result.orderNumber ?? 'Pedido recibido');
      setCart([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No pudimos enviar el pedido.');
    } finally {
      setSending(false);
    }
  };

  const content = useMemo(() => {
    if (loading) return <div className={styles.state}>Cargando catálogo…</div>;
    if (!catalog) return <div className={styles.state}><h1>Catálogo no disponible</h1><p>{error}</p></div>;
    return null;
  }, [catalog, error, loading]);
  if (content) return content;
  if (!catalog) return null;

  return <main className={styles.page}>
    <title>{catalog.name}</title>
    <header className={styles.header}>
      <div><span>CATÁLOGO</span><h1>{catalog.name}</h1></div>
      <button type="button" className={styles.cartButton} onClick={() => setCartOpen(true)}><ShoppingBag size={20} /> Carrito <b>{totalItems}</b></button>
    </header>
    {error && <div className={styles.alert}>{error}<button type="button" onClick={() => setError('')}><X size={16} /></button></div>}
    <section className={styles.products}>
      {catalog.products.map((product) => {
        const selectedVariantId = selectedVariants[product.id];
        const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId);
        const displayedPrice = Number(selectedVariant?.price ?? product.price ?? 0);

        return <article className={styles.product} key={product.id}>
          <div className={styles.image}>{product.images[0] ? <img src={product.images[0]} alt={product.name} /> : <ShoppingBag size={42} />}</div>
          <div className={styles.productBody}><h2>{product.name}</h2>{product.description && <p>{product.description}</p>}
            {product.variants.length > 0 && <select aria-label={`Variante de ${product.name}`} value={selectedVariantId ?? ''} onChange={(event) => setSelectedVariants((current) => ({ ...current, [product.id]: event.target.value }))}>
              <option value="">Selecciona una variante</option>{product.variants.map((variant) => <option key={variant.id} value={variant.id} disabled={!variant.available}>{variantOptionLabel(product.name, variant)}{!variant.available ? ' · Agotada' : ''}</option>)}
            </select>}
            <div className={styles.productFooter}>{catalog.settings.showPrices && <strong>{money(displayedPrice, catalog.currency)}</strong>}<button type="button" disabled={!product.available} onClick={() => addProduct(product)}><Plus size={17} />{product.available ? 'Añadir' : 'Agotado'}</button></div>
          </div>
        </article>;
      })}
    </section>
    {cartOpen && <div className={styles.overlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}><aside className={styles.cart} aria-label="Carrito">
      <header><div><span>Tu pedido</span><h2>{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</h2></div><button type="button" onClick={() => setCartOpen(false)}><X /></button></header>
      {orderNumber ? <div className={styles.success}><CheckCircle2 size={48} /><h3>¡Pedido recibido!</h3><p>Tu número es <strong>{orderNumber}</strong>.</p><button type="button" onClick={() => { setOrderNumber(''); setCartOpen(false); }}>Cerrar</button></div> : <>
        <div className={styles.lines}>{cart.length === 0 ? <p>Tu carrito está vacío.</p> : cart.map((line) => <div className={styles.line} key={line.key}><div><strong>{line.product.name}</strong>{line.variantName && <span>{line.variantName}</span>}</div><div className={styles.quantity}><button type="button" onClick={() => changeQuantity(line.key, -1)}><Minus size={14} /></button><span>{line.quantity}</span><button type="button" onClick={() => changeQuantity(line.key, 1)}><Plus size={14} /></button><button type="button" onClick={() => setCart((current) => current.filter((item) => item.key !== line.key))}><Trash2 size={15} /></button></div></div>)}</div>
        {cart.length > 0 && <form className={styles.form} onSubmit={submitOrder}><h3>Datos de contacto</h3><div className={styles.formGrid}><label>Nombre *<input name="name" required /></label><label>Correo *<input name="email" type="email" required /></label><label>Teléfono<input name="phone" /></label><label>Empresa<input name="company" /></label></div><label>Notas<textarea name="notes" rows={3} /></label>{catalog.settings.showPrices && <div className={styles.total}><span>Total estimado</span><strong>{money(total, catalog.currency)}</strong></div>}<button className={styles.submit} type="submit" disabled={sending}>{sending ? 'Enviando…' : 'Enviar pedido'}</button></form>}
      </>}
    </aside></div>}
  </main>;
};

export default PublicCatalog;
