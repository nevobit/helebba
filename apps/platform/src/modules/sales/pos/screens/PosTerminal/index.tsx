import { useMemo, useState } from 'react';
import { Button } from '@hlb/design-system';
import type { PosReceipt, Product, ProductVariant } from '@hlb/contracts';
import { Minus, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useProducts } from '@/modules/inventary/products/hooks';
import { usePosStore, usePosTransactions } from '../../hooks';
import styles from './PosTerminal.module.css';

type CartLine = { key: string; product: Product; variant?: ProductVariant; quantity: number };
const money = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 2,
  }).format(value);
const PosTerminal = () => {
  const { storeId, registerId } = useParams();
  const { store } = usePosStore(storeId);
  const { products, isLoading } = useProducts({ page: 1, limit: 100 });
  const { createSale, isSelling } = usePosTransactions();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [method, setMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'other'>('cash');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<PosReceipt>();
  const register = store?.registers.find((item) => String(item.id) === registerId);
  const available = useMemo(
    () =>
      products.filter(
        (item) =>
          item.forSale &&
          item.inPos &&
          (item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.sku?.toLowerCase().includes(search.toLowerCase())),
      ),
    [products, search],
  );
  const add = (product: Product, variant?: ProductVariant) => {
    const variantId = variant?.id ?? variant?.variantId;
    const key = `${product.id}:${variantId ?? ''}`;
    setCart((current) => {
      const found = current.find((item) => item.key === key);
      return found
        ? current.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...current, { key, product, variant, quantity: 1 }];
    });
  };
  const change = (key: string, amount: number) =>
    setCart((current) =>
      current
        .map((item) => (item.key === key ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0),
    );
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.variant?.price ?? item.product.price ?? 0) * item.quantity,
    0,
  );
  const tax = cart.reduce(
    (sum, item) =>
      sum +
      (Number(item.variant?.price ?? item.product.price ?? 0) *
        item.quantity *
        Number(item.product.taxRate ?? 0)) /
        100,
    0,
  );
  const total = Math.round((subtotal + tax + Number.EPSILON) * 100) / 100;
  const charge = () => {
    if (!storeId || !registerId || !cart.length) return;
    setError('');
    createSale(
      {
        storeId,
        registerId,
        payload: {
          lines: cart.map((item) => ({
            productId: String(item.product.id),
            variantId: item.variant?.id ?? item.variant?.variantId,
            quantity: item.quantity,
          })),
          payments: [{ method, amount: total }],
        },
      },
      {
        onSuccess: (result) => {
          setReceipt(result);
          setCart([]);
        },
        onError: (reason: Error) => setError(reason.message),
      },
    );
  };
  if (!store || !register) return <main className={styles.loading}>Cargando caja...</main>;
  if (register.status !== 'open')
    return (
      <main className={styles.closed}>
        <h1>La caja está cerrada</h1>
        <p>Abre una sesión desde la tienda antes de vender.</p>
        <Link to={`/pos/${storeId}`}>Volver a la tienda</Link>
      </main>
    );
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link to={`/pos/${storeId}`}>← Volver</Link>
          <h1>
            {store.name} · {register.name}
          </h1>
        </div>
        <span className={styles.open}>Caja abierta</span>
      </header>
      <div className={styles.layout}>
        <section className={styles.catalog}>
          <label className={styles.search}>
            <Search size={18} />
            <input
              placeholder="Buscar por nombre o SKU"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          {isLoading ? (
            <p>Cargando productos...</p>
          ) : (
            <div className={styles.grid}>
              {available.map((product) => (
                <article className={styles.product} key={String(product.id)}>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" />
                  ) : (
                    <div className={styles.placeholder}>Producto</div>
                  )}
                  <h3>{product.name}</h3>
                  <strong>{money(product.price)}</strong>
                  {product.variants?.length ? (
                    <select
                      defaultValue=""
                      onChange={(event) => {
                        const variant = product.variants.find(
                          (item) => (item.id ?? item.variantId) === event.target.value,
                        );
                        if (variant) add(product, variant);
                        event.currentTarget.value = '';
                      }}
                    >
                      <option value="" disabled>
                        Elegir variante
                      </option>
                      {product.variants.map((variant) => (
                        <option
                          key={variant.id ?? variant.variantId}
                          value={variant.id ?? variant.variantId}
                        >
                          {variant.name || `${variant.color?.name ?? ''} ${variant.size ?? ''}`} ·{' '}
                          {money(variant.price)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Button onClick={() => add(product)}>Añadir</Button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
        <aside className={styles.cart}>
          <h2>
            <ShoppingCart size={20} /> Venta actual
          </h2>
          {cart.length ? (
            cart.map((item) => (
              <div className={styles.line} key={item.key}>
                <div>
                  <strong>{item.variant?.name ?? item.product.name}</strong>
                  <small>{money(item.variant?.price ?? item.product.price)}</small>
                </div>
                <div className={styles.quantity}>
                  <button onClick={() => change(item.key, -1)}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => change(item.key, 1)}>
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setCart((current) => current.filter((line) => line.key !== item.key))
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>Añade productos para comenzar.</div>
          )}
          <div className={styles.totals}>
            <p>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </p>
            <p>
              <span>Impuestos</span>
              <strong>{money(tax)}</strong>
            </p>
            <p className={styles.total}>
              <span>Total</span>
              <strong>{money(total)}</strong>
            </p>
          </div>
          <label>
            Método de pago
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value as typeof method)}
            >
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="bank_transfer">Transferencia</option>
              <option value="other">Otro</option>
            </select>
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <Button disabled={!cart.length} loading={isSelling} onClick={charge}>
            Cobrar {money(total)}
          </Button>
          {receipt && (
            <div className={styles.success}>
              <strong>Venta registrada</strong>
              <span>Ticket {receipt.number}</span>
              <span>{money(receipt.total)}</span>
              <button onClick={() => window.print()}>Imprimir ticket</button>
              <button onClick={() => setReceipt(undefined)}>Cerrar</button>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
};
export default PosTerminal;
