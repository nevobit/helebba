import type {
  PersistedEntity,
  PersistedSoftDeletableEntity,
  PosReceiptId,
  PosRegisterId,
  PosSessionId,
  PosStoreId,
  ProductId,
  UserId,
  WarehouseId,
} from '../../../common';

export interface PosCashRegister {
  id: PosRegisterId;
  name: string;
  description: string;
  isMain: boolean;
  status: 'open' | 'closed';
  paymentMethodIds: string[];
}

export interface PosSession {
  id: PosSessionId;
  registerId: PosRegisterId;
  registerName: string;
  openedAt: Date;
  closedAt?: Date;
  status: 'open' | 'closed';
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  discrepancy?: number;
  salesTotal: number;
  receiptCount: number;
  openedBy: UserId;
  closedBy?: UserId;
}

export interface PosReceiptLine {
  productId: ProductId;
  variantId?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface PosPayment {
  method: 'cash' | 'card' | 'bank_transfer' | 'other';
  amount: number;
  reference?: string;
}

export interface PosReceipt extends PersistedEntity<PosReceiptId, UserId> {
  storeId: PosStoreId;
  storeName: string;
  registerId: PosRegisterId;
  registerName: string;
  sessionId: PosSessionId;
  number: string;
  lines: PosReceiptLine[];
  payments: PosPayment[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'completed' | 'refunded';
}

export interface PosStore extends PersistedSoftDeletableEntity<PosStoreId, UserId> {
  name: string;
  address: string;
  phone?: string;
  warehouseId: WarehouseId;
  warehouseName: string;
  active: boolean;
  registers: PosCashRegister[];
  sessions: PosSession[];
}
