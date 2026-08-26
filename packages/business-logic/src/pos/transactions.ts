import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PosReceiptSchemaMongo,
  PosStoreSchemaMongo,
  ProductSchemaMongo,
  type OrganizationId,
  type PosPayment,
  type PosReceipt,
  type PosReceiptLine,
  type PosRegisterId,
  type PosSession,
  type PosSessionId,
  type PosStore,
  type PosStoreId,
  type Product,
  type ProductId,
  type UserId,
} from '@hlb/contracts';
const stores = () => getModel<PosStore>(Collection.POS_STORES, PosStoreSchemaMongo);
const receipts = () => getModel<PosReceipt>(Collection.POS_RECEIPTS, PosReceiptSchemaMongo);
const products = () => getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const matchesEmbeddedId = (item: { id?: unknown; _id?: unknown }, expected: unknown) =>
  [item.id, item._id].some((value) => value != null && String(value) === String(expected));
const variantIdentity = (
  variant: { id?: unknown; _id?: unknown; variantId?: unknown },
  requestedId: string,
) => {
  const field = (['_id', 'id', 'variantId'] as const).find(
    (candidate) => variant[candidate] != null && String(variant[candidate]) === String(requestedId),
  );
  return field ? { field, value: variant[field] } : undefined;
};
export const openPosSession = async (
  storeId: PosStoreId,
  registerId: PosRegisterId,
  organizationId: OrganizationId,
  userId: UserId,
  openingBalance: number,
) => {
  if (!Number.isFinite(openingBalance) || openingBalance < 0)
    throw new Error('El saldo inicial debe ser igual o mayor que cero.');
  const sessionId = randomUUID() as PosSessionId;
  const session = {
    id: sessionId,
    registerId,
    registerName: '',
    openedAt: new Date(),
    status: 'open',
    openingBalance,
    salesTotal: 0,
    receiptCount: 0,
    openedBy: userId,
  } as PosSession;
  const current = await stores().findOne({
    _id: storeId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    registers: { $elemMatch: { id: registerId, status: 'closed' } },
    sessions: { $not: { $elemMatch: { registerId, status: 'open' } } },
  });
  const register = current?.registers.find((item) => String(item.id) === String(registerId));
  if (register) session.registerName = register.name;
  const store = register ? await stores().findOneAndUpdate(
    {
      _id: storeId,
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
      registers: { $elemMatch: { id: registerId, status: 'closed' } },
      sessions: { $not: { $elemMatch: { registerId, status: 'open' } } },
    },
    { $set: { 'registers.$[register].status': 'open', updatedBy: userId }, $push: { sessions: session } },
    { arrayFilters: [{ 'register.id': registerId, 'register.status': 'closed' }], new: true },
  ) : null;
  if (!store) {
    const existing = await stores().findOne({ _id: storeId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } });
    if (!existing) throw new Error('Tienda POS no encontrada para la organización actual.');
    if (!existing.registers.some((item) => String(item.id) === String(registerId))) throw new Error('Caja registradora no encontrada dentro de la tienda.');
    throw new Error('Esta caja ya tiene una sesión abierta.');
  }
  return { store, sessionId };
};
export const closePosSession = async (
  storeId: PosStoreId,
  registerId: PosRegisterId,
  organizationId: OrganizationId,
  userId: UserId,
  closingBalance: number,
) => {
  if (!Number.isFinite(closingBalance) || closingBalance < 0)
    throw new Error('El saldo final debe ser igual o mayor que cero.');
  const store = await stores().findOne({
    _id: storeId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  const session = store?.sessions.find(
    (item) => String(item.registerId) === String(registerId) && item.status === 'open',
  );
  const register = store?.registers.find((item) =>
    matchesEmbeddedId(item as typeof item & { _id?: unknown }, registerId),
  );
  if (!store || !register || !session) throw new Error('No hay una sesión abierta para esta caja.');
  const completed = await receipts().find({
    organizationId,
    sessionId: session.id,
    status: 'completed',
  });
  const cashSales = completed.reduce(
    (total, receipt) =>
      total +
      receipt.payments
        .filter((payment) => payment.method === 'cash')
        .reduce((sum, payment) => sum + payment.amount, 0),
    0,
  );
  const expectedBalance = round(session.openingBalance + cashSales);
  const discrepancy = round(closingBalance - expectedBalance);
  register.id = registerId;
  register.status = 'closed';
  session.status = 'closed';
  session.closedAt = new Date();
  session.closingBalance = closingBalance;
  session.expectedBalance = expectedBalance;
  session.discrepancy = discrepancy;
  session.closedBy = userId;
  store.set('updatedBy', userId);
  await store.save();
  return { store, expectedBalance, discrepancy };
};
export type PosSaleInput = {
  lines: Array<{ productId: ProductId; variantId?: string; quantity: number }>;
  payments: PosPayment[];
  idempotencyKey?: string;
};
export const createPosSale = async (
  storeId: PosStoreId,
  registerId: PosRegisterId,
  organizationId: OrganizationId,
  userId: UserId,
  input: PosSaleInput,
) => {
  if (!input.lines.length) throw new Error('Añade al menos un producto al carrito.');
  if (!input.payments.length) throw new Error('Añade un método de pago.');
  if (input.idempotencyKey) {
    const previous = await receipts().findOne({ organizationId, idempotencyKey: input.idempotencyKey });
    if (previous) return previous;
  }
  const dbSession = await stores().db.startSession();
  let created: PosReceipt | undefined;
  try {
    await dbSession.withTransaction(async () => {
      const store = await stores()
        .findOne({
          _id: storeId,
          organizationId,
          lifecycleStatus: { $ne: LifecycleStatus.DELETED },
        })
        .session(dbSession);
      const register = store?.registers.find((item) =>
        matchesEmbeddedId(item as typeof item & { _id?: unknown }, registerId),
      );
      const posSession = store?.sessions.find(
        (item) => String(item.registerId) === String(registerId) && item.status === 'open',
      );
      if (!store || !register || register.status !== 'open' || !posSession)
        throw new Error('Abre la caja antes de registrar una venta.');
      const lines: PosReceiptLine[] = [];
      for (const requested of input.lines) {
        if (!Number.isFinite(requested.quantity) || requested.quantity <= 0)
          throw new Error('Las cantidades deben ser mayores que cero.');
        const product = await products()
          .findOne({
            _id: requested.productId,
            organizationId,
            lifecycleStatus: { $ne: LifecycleStatus.DELETED },
            forSale: true,
            inPos: true,
          })
          .session(dbSession);
        if (!product) throw new Error('Uno de los productos no está disponible en POS.');
        const variant = requested.variantId
          ? product.variants?.find((item) =>
              variantIdentity(
                item as typeof item & { _id?: unknown },
                requested.variantId as string,
              ),
            )
          : undefined;
        if (requested.variantId && !variant)
          throw new Error(`La variante de “${product.name}” no existe.`);
        const available = variant ? variant.stock : product.stock;
        if (product.hasStock && available < requested.quantity)
          throw new Error(`Stock insuficiente para “${variant?.name ?? product.name}”.`);
        const unitPrice = Number(variant?.price ?? product.price ?? 0),
          subtotal = round(unitPrice * requested.quantity),
          tax = round((subtotal * Number(product.taxRate ?? 0)) / 100),
          total = round(subtotal + tax);
        lines.push({
          productId: product.id,
          variantId: requested.variantId,
          name: variant?.name ?? product.name,
          sku: variant?.sku ?? product.sku,
          quantity: requested.quantity,
          unitPrice,
          taxRate: Number(product.taxRate ?? 0),
          subtotal,
          tax,
          total,
        });
        if (product.hasStock) {
          const identity =
            variant && requested.variantId
              ? variantIdentity(variant as typeof variant & { _id?: unknown }, requested.variantId)
              : undefined;
          if (variant && !identity)
            throw new Error(`No pudimos identificar la variante de “${product.name}”.`);
          const update = variant
            ? await products().updateOne(
                {
                  _id: product.id,
                  organizationId,
                  stock: { $gte: requested.quantity },
                  [`variants.${identity!.field}`]: identity!.value,
                },
                {
                  $inc: {
                    stock: -requested.quantity,
                    'variants.$[variant].stock': -requested.quantity,
                  },
                },
                {
                  arrayFilters: [
                    {
                      [`variant.${identity!.field}`]: identity!.value,
                      'variant.stock': { $gte: requested.quantity },
                    },
                  ],
                  session: dbSession,
                },
              )
            : await products().updateOne(
                { _id: product.id, organizationId, stock: { $gte: requested.quantity } },
                { $inc: { stock: -requested.quantity } },
                { session: dbSession },
              );
          if (!update.modifiedCount)
            throw new Error(`No pudimos descontar el stock de “${product.name}”.`);
        }
      }
      const subtotal = round(lines.reduce((sum, line) => sum + line.subtotal, 0)),
        tax = round(lines.reduce((sum, line) => sum + line.tax, 0)),
        total = round(subtotal + tax),
        paid = round(input.payments.reduce((sum, payment) => sum + payment.amount, 0));
      if (
        input.payments.some((payment) => !Number.isFinite(payment.amount) || payment.amount < 0) ||
        paid < total
      )
        throw new Error('El importe pagado no cubre el total.');
      const [receipt] = await receipts().create(
        [
          {
            organizationId,
            createdBy: userId,
            updatedBy: userId,
            idempotencyKey: input.idempotencyKey,
            storeId,
            storeName: store.name,
            registerId,
            registerName: register.name,
            sessionId: posSession.id,
            number: `POS-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`,
            lines,
            payments: input.payments,
            subtotal,
            tax,
            total,
            status: 'completed',
          },
        ],
        { session: dbSession },
      );
      await stores().updateOne(
        { _id: storeId, organizationId },
        {
          $inc: { 'sessions.$[session].salesTotal': total, 'sessions.$[session].receiptCount': 1 },
        },
        { arrayFilters: [{ 'session.id': posSession.id }], session: dbSession },
      );
      created = receipt;
    });
  } catch (error) {
    if (input.idempotencyKey && (error as { code?: number }).code === 11000) {
      created =
        (await receipts().findOne({
          organizationId,
          idempotencyKey: input.idempotencyKey,
        })) ?? undefined;
      if (!created) throw error;
    } else {
      throw error;
    }
  } finally {
    await dbSession.endSession();
  }
  if (!created) throw new Error('No pudimos registrar la venta.');
  return created;
};
export const listPosReceipts = async (storeId: PosStoreId, organizationId: OrganizationId) =>
  receipts().find({ storeId, organizationId }).sort({ createdAt: -1 }).limit(100);

export const refundPosReceipt = async (
  storeId: PosStoreId,
  receiptId: string,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const dbSession = await receipts().db.startSession();
  let refunded: PosReceipt | undefined;
  try {
    await dbSession.withTransaction(async () => {
      const receipt = await receipts()
        .findOne({
          _id: receiptId,
          storeId,
          organizationId,
          status: 'completed',
        })
        .session(dbSession);
      if (!receipt) {
        const existing = await receipts()
          .findOne({ _id: receiptId, storeId, organizationId })
          .session(dbSession);
        if (existing?.status === 'refunded') throw new Error('Este ticket ya fue devuelto.');
        throw new Error('Ticket no encontrado para esta tienda.');
      }

      for (const line of receipt.lines) {
        const product = await products()
          .findOne({
            _id: line.productId,
            organizationId,
            lifecycleStatus: { $ne: LifecycleStatus.DELETED },
          })
          .session(dbSession);
        if (!product?.hasStock) continue;

        if (line.variantId) {
          const variant = product.variants?.find((item) =>
            variantIdentity(item as typeof item & { _id?: unknown }, line.variantId as string),
          );
          const identity = variant
            ? variantIdentity(variant as typeof variant & { _id?: unknown }, line.variantId)
            : undefined;
          if (!identity)
            throw new Error(`La variante devuelta de “${product.name}” ya no existe.`);
          await products().updateOne(
            { _id: product.id, organizationId, [`variants.${identity.field}`]: identity.value },
            { $inc: { stock: line.quantity, 'variants.$[variant].stock': line.quantity } },
            {
              arrayFilters: [{ [`variant.${identity.field}`]: identity.value }],
              session: dbSession,
            },
          );
        } else {
          await products().updateOne(
            { _id: product.id, organizationId },
            { $inc: { stock: line.quantity } },
            { session: dbSession },
          );
        }
      }

      const updated = await receipts().findOneAndUpdate(
        { _id: receipt.id, storeId, organizationId, status: 'completed' },
        {
          $set: {
            status: 'refunded',
            refundedAt: new Date(),
            refundedBy: userId,
            updatedBy: userId,
          },
        },
        { new: true, session: dbSession },
      );
      if (!updated) throw new Error('Este ticket ya fue devuelto.');

      await stores().updateOne(
        { _id: storeId, organizationId, 'sessions.id': receipt.sessionId },
        {
          $inc: {
            'sessions.$[session].salesTotal': -receipt.total,
            'sessions.$[session].receiptCount': -1,
          },
          $set: { updatedBy: userId },
        },
        { arrayFilters: [{ 'session.id': receipt.sessionId }], session: dbSession },
      );
      refunded = updated;
    });
  } finally {
    await dbSession.endSession();
  }
  if (!refunded) throw new Error('No pudimos completar la devolución.');
  return refunded;
};
