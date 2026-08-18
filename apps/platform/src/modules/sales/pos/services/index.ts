import { api } from '@/shared/api';
import type {
  OffsetPaginatedResult,
  PosCashRegister,
  PosPayment,
  PosReceipt,
  PosStore,
} from '@hlb/contracts';
export type PosStorePayload = Partial<Pick<PosStore, 'name' | 'address' | 'phone' | 'warehouseId'>>;
export const posStores = async () =>
  (
    await api.get<OffsetPaginatedResult<PosStore>>('/pos/stores', {
      params: { page: 1, limit: 100 },
    })
  ).data;
export const posStore = async (id: string) => (await api.get<PosStore>(`/pos/stores/${id}`)).data;
export const createPosStore = async (payload: PosStorePayload) =>
  (await api.post<PosStore>('/pos/stores', payload)).data;
export const addPosRegister = async (storeId: string, payload: Partial<PosCashRegister>) =>
  (await api.post<PosStore>(`/pos/stores/${storeId}/registers`, payload)).data;
export const deletePosStore = async (id: string) =>
  (await api.delete<boolean>(`/pos/stores/${id}`)).data;
export const openPosSession = async (storeId: string, registerId: string, openingBalance: number) =>
  (
    await api.post<{ store: PosStore; sessionId: string }>(
      `/pos/stores/${storeId}/registers/${registerId}/open`,
      { openingBalance },
    )
  ).data;
export const closePosSession = async (
  storeId: string,
  registerId: string,
  closingBalance: number,
) =>
  (
    await api.post<{ store: PosStore; expectedBalance: number; discrepancy: number }>(
      `/pos/stores/${storeId}/registers/${registerId}/close`,
      { closingBalance },
    )
  ).data;
export type PosSalePayload = {
  lines: Array<{ productId: string; variantId?: string; quantity: number }>;
  payments: PosPayment[];
};
export const createPosSale = async (storeId: string, registerId: string, payload: PosSalePayload) =>
  (await api.post<PosReceipt>(`/pos/stores/${storeId}/registers/${registerId}/sales`, payload))
    .data;
export const posReceipts = async (storeId: string) =>
  (await api.get<PosReceipt[]>(`/pos/stores/${storeId}/receipts`)).data;
