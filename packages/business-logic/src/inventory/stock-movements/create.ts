import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ProductSchemaMongo,
  StockMovementSchemaMongo,
  type OrganizationId,
  type Product,
  type ProductId,
  type StockMovement,
  type StockMovementType,
  type UserId,
} from '@hlb/contracts';

export type CreateStockMovementInput = {
  productId: ProductId;
  organizationId: OrganizationId;
  type: StockMovementType;
  quantity: number;
  reason: string;
  variantId?: string;
  createdBy: UserId;
};

export const createStockMovement = async ({
  productId,
  organizationId,
  type,
  quantity,
  reason,
  variantId,
  createdBy,
}: CreateStockMovementInput): Promise<StockMovement> => {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('La cantidad debe ser un número mayor que cero.');
  }

  const productModel = getModel<Product>(Collection.PRODUCTS, ProductSchemaMongo);
  const product = await productModel.findOne({
    _id: productId,
    organizationId,
  });
  if (!product) throw new Error('El producto no existe o no pertenece a la organización.');

  const isVariant = Boolean(variantId);
  const variant = isVariant ? (product.variants ?? []).find((item) => String(item.id) === variantId) : undefined;
  if (isVariant && !variant) throw new Error('La variante no pertenece a este producto.');

  const previousStock = isVariant ? Number(variant?.stock ?? 0) : Number(product.stock ?? 0);
  const delta = type === 'out' ? -quantity : quantity;
  const newStock = Math.max(0, previousStock + delta);

  const movementModel = getModel<StockMovement>(Collection.STOCK_MOVEMENTS, StockMovementSchemaMongo);
  const movement = new movementModel({
    productId,
    organizationId,
    variantId,
    warehouseId: product.warehouseId,
    type,
    quantity,
    reason,
    previousStock,
    newStock,
    createdBy,
  });
  await movement.save();

  if (isVariant) {
    const updatedVariants = (product.variants ?? []).map((item) =>
      String(item.id) === variantId ? { ...item, stock: newStock } : item,
    );
    await productModel.updateOne(
      { _id: productId, organizationId },
      {
        $set: {
          variants: updatedVariants,
          stock: updatedVariants.reduce((total, item) => total + Number(item.stock ?? 0), 0),
          updatedAt: new Date(),
        },
      },
    );
  } else {
    await productModel.updateOne(
      { _id: productId, organizationId },
      {
        $set: { stock: newStock, updatedAt: new Date() },
      },
    );
  }

  return movement;
};