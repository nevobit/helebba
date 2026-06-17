import { api } from '@/shared/api';
import type {
  BankingAccount,
  OffsetPaginatedResult,
  TreasuryAccountKind,
  TreasuryMovement,
} from '@hlb/contracts';

export type TreasuryAccountListParams = {
  page?: number;
  limit?: number;
  search?: string;
  kind?: TreasuryAccountKind | 'all';
  includeArchived?: boolean;
};

export type CreateTreasuryAccountPayload = Partial<BankingAccount>;
export type UpdateTreasuryAccountPayload = Partial<BankingAccount>;
export type CreateTreasuryMovementPayload = Partial<TreasuryMovement>;
export type ReconcileTreasuryMovementPayload = Partial<TreasuryMovement>;

export const treasuryAccounts = async (params: TreasuryAccountListParams = {}) => {
  const { data } = await api.get<OffsetPaginatedResult<BankingAccount>>('/treasury/accounts', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
      search: params.search?.trim() || undefined,
      kind: params.kind ?? 'all',
      includeArchived: params.includeArchived || undefined,
    },
  });

  return data;
};

export const treasuryAccount = async (accountId: string) => {
  const { data } = await api.get<BankingAccount>(`/treasury/accounts/${accountId}`);

  return data;
};

export const createTreasuryAccount = async (payload: CreateTreasuryAccountPayload) => {
  const { data } = await api.post<BankingAccount>('/treasury/accounts', payload);

  return data;
};

export const updateTreasuryAccount = async (
  accountId: string,
  payload: UpdateTreasuryAccountPayload,
) => {
  const { data } = await api.put<BankingAccount>(`/treasury/accounts/${accountId}`, payload);

  return data;
};

export const archiveTreasuryAccount = async (accountId: string) => {
  const { data } = await api.post<BankingAccount>(`/treasury/accounts/${accountId}/archive`);

  return data;
};

export const deleteTreasuryAccount = async (accountId: string) => {
  const { data } = await api.delete<BankingAccount>(`/treasury/accounts/${accountId}`);

  return data;
};

export const bankMovements = async (accountId: string, params: { page?: number; limit?: number } = {}) => {
  const { data } = await api.get<OffsetPaginatedResult<TreasuryMovement>>(
    `/treasury/accounts/${accountId}/bank-movements`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
      },
    },
  );

  return data;
};

export const cashMovements = async (accountId: string, params: { page?: number; limit?: number } = {}) => {
  const { data } = await api.get<OffsetPaginatedResult<TreasuryMovement>>(
    `/treasury/accounts/${accountId}/cash-movements`,
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
      },
    },
  );

  return data;
};

export const createBankMovement = async (
  accountId: string,
  payload: CreateTreasuryMovementPayload,
) => {
  const { data } = await api.post<TreasuryMovement>(
    `/treasury/accounts/${accountId}/bank-movements`,
    payload,
  );

  return data;
};

export const createCashMovement = async (
  accountId: string,
  payload: CreateTreasuryMovementPayload,
) => {
  const { data } = await api.post<TreasuryMovement>(
    `/treasury/accounts/${accountId}/cash-movements`,
    payload,
  );

  return data;
};

export const reconcileBankMovement = async (
  accountId: string,
  movementId: string,
  payload: ReconcileTreasuryMovementPayload = {},
) => {
  const { data } = await api.post<TreasuryMovement>(
    `/treasury/accounts/${accountId}/bank-movements/${movementId}/reconcile`,
    payload,
  );

  return data;
};
