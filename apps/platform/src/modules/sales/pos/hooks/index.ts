import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addPosRegister,
  closePosSession,
  createPosSale,
  createPosStore,
  deletePosStore,
  openPosSession,
  posReceipts,
  posStore,
  posStores,
  type PosSalePayload,
  type PosStorePayload,
} from '../services';
export const usePosStores = () => {
  const query = useQuery({ queryKey: ['pos-stores'], queryFn: posStores });
  return { stores: query.data?.items ?? [], isLoading: query.isLoading, error: query.error };
};
export const usePosStore = (id?: string) => {
  const query = useQuery({
    queryKey: ['pos-store', id],
    queryFn: () => posStore(id!),
    enabled: Boolean(id),
  });
  return { store: query.data, isLoading: query.isLoading, error: query.error };
};
export const usePosReceipts = (storeId?: string) => {
  const query = useQuery({
    queryKey: ['pos-receipts', storeId],
    queryFn: () => posReceipts(storeId!),
    enabled: Boolean(storeId),
  });
  return { receipts: query.data ?? [], isLoading: query.isLoading };
};
export const usePosMutations = () => {
  const client = useQueryClient();
  const create = useMutation({
    mutationFn: createPosStore,
    onSuccess: () => client.invalidateQueries({ queryKey: ['pos-stores'] }),
  });
  const register = useMutation({
    mutationFn: ({
      storeId,
      payload,
    }: {
      storeId: string;
      payload: Parameters<typeof addPosRegister>[1];
    }) => addPosRegister(storeId, payload),
    onSuccess: (store) => {
      client.setQueryData(['pos-store', String(store.id)], store);
      client.invalidateQueries({ queryKey: ['pos-stores'] });
    },
  });
  const remove = useMutation({
    mutationFn: deletePosStore,
    onSuccess: () => client.invalidateQueries({ queryKey: ['pos-stores'] }),
  });
  return {
    createStore: create.mutate,
    addRegister: register.mutate,
    deleteStore: remove.mutate,
    isCreatingStore: create.isPending,
    isAddingRegister: register.isPending,
    isDeletingStore: remove.isPending,
  } as const;
};
export type { PosStorePayload };
export const usePosTransactions = () => {
  const client = useQueryClient();
  const refresh = (storeId: string) => {
    client.invalidateQueries({ queryKey: ['pos-store', storeId] });
    client.invalidateQueries({ queryKey: ['pos-stores'] });
    client.invalidateQueries({ queryKey: ['pos-receipts', storeId] });
  };
  const open = useMutation({
    mutationFn: ({
      storeId,
      registerId,
      openingBalance,
    }: {
      storeId: string;
      registerId: string;
      openingBalance: number;
    }) => openPosSession(storeId, registerId, openingBalance),
    onSuccess: (_, v) => refresh(v.storeId),
  });
  const close = useMutation({
    mutationFn: ({
      storeId,
      registerId,
      closingBalance,
    }: {
      storeId: string;
      registerId: string;
      closingBalance: number;
    }) => closePosSession(storeId, registerId, closingBalance),
    onSuccess: (_, v) => refresh(v.storeId),
  });
  const sale = useMutation({
    mutationFn: ({
      storeId,
      registerId,
      payload,
    }: {
      storeId: string;
      registerId: string;
      payload: PosSalePayload;
    }) => createPosSale(storeId, registerId, payload),
    onSuccess: (_, v) => {
      refresh(v.storeId);
      client.invalidateQueries({ queryKey: ['products'] });
    },
  });
  return {
    openSession: open.mutate,
    closeSession: close.mutate,
    createSale: sale.mutate,
    isOpening: open.isPending,
    isClosing: close.isPending,
    isSelling: sale.isPending,
  };
};
