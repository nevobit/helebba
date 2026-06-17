import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveTreasuryAccount,
  bankMovements,
  cashMovements,
  createBankMovement,
  createCashMovement,
  createTreasuryAccount,
  deleteTreasuryAccount,
  reconcileBankMovement,
  treasuryAccount,
  treasuryAccounts,
  updateTreasuryAccount,
  type CreateTreasuryAccountPayload,
  type CreateTreasuryMovementPayload,
  type ReconcileTreasuryMovementPayload,
  type TreasuryAccountListParams,
  type UpdateTreasuryAccountPayload,
} from '../services';

export const treasuryAccountsQueryKey = (params?: TreasuryAccountListParams) => [
  'treasury-accounts',
  params,
];

export const treasuryAccountQueryKey = (accountId?: string) => ['treasury-account', accountId];
export const treasuryMovementsQueryKey = (accountId?: string, kind?: string) => [
  'treasury-movements',
  accountId,
  kind,
];

export const useTreasuryAccounts = (params: TreasuryAccountListParams = {}) => {
  const query = useQuery({
    queryKey: treasuryAccountsQueryKey(params),
    queryFn: () => treasuryAccounts(params),
  });

  return {
    accounts: query.data?.items ?? [],
    pageInfo: query.data?.pageInfo,
    total: query.data?.count ?? 0,
    ...query,
  };
};

export const useTreasuryAccount = (accountId?: string) => {
  const query = useQuery({
    queryKey: treasuryAccountQueryKey(accountId),
    queryFn: () => treasuryAccount(accountId as string),
    enabled: Boolean(accountId),
  });

  return {
    account: query.data,
    ...query,
  };
};

export const useTreasuryMovements = (accountId?: string, kind: 'bank' | 'cash' = 'bank') => {
  const query = useQuery({
    queryKey: treasuryMovementsQueryKey(accountId, kind),
    queryFn: () => (kind === 'cash' ? cashMovements(accountId as string) : bankMovements(accountId as string)),
    enabled: Boolean(accountId),
  });

  return {
    movements: query.data?.items ?? [],
    ...query,
  };
};

export const useCreateTreasuryAccount = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateTreasuryAccountPayload) => createTreasuryAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury-accounts'] });
    },
  });

  return { createAccount: mutation.mutate, isCreatingAccount: mutation.isPending };
};

export const useUpdateTreasuryAccount = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ accountId, payload }: { accountId: string; payload: UpdateTreasuryAccountPayload }) =>
      updateTreasuryAccount(accountId, payload),
    onSuccess: (account) => {
      queryClient.invalidateQueries({ queryKey: ['treasury-accounts'] });
      queryClient.invalidateQueries({ queryKey: treasuryAccountQueryKey(String(account.id)) });
    },
  });

  return { updateAccount: mutation.mutate, isUpdatingAccount: mutation.isPending };
};

export const useArchiveTreasuryAccount = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (accountId: string) => archiveTreasuryAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['treasury-account'] });
    },
  });

  return { archiveAccount: mutation.mutate, isArchivingAccount: mutation.isPending };
};

export const useDeleteTreasuryAccount = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (accountId: string) => deleteTreasuryAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['treasury-account'] });
    },
  });

  return { deleteAccount: mutation.mutate, isDeletingAccount: mutation.isPending };
};

export const useCreateBankMovement = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ accountId, payload }: { accountId: string; payload: CreateTreasuryMovementPayload }) =>
      createBankMovement(accountId, payload),
    onSuccess: (_movement, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treasury-accounts'] });
      queryClient.invalidateQueries({ queryKey: treasuryAccountQueryKey(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: treasuryMovementsQueryKey(variables.accountId, 'bank') });
    },
  });

  return { createMovement: mutation.mutate, isCreatingMovement: mutation.isPending };
};

export const useCreateCashMovement = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ accountId, payload }: { accountId: string; payload: CreateTreasuryMovementPayload }) =>
      createCashMovement(accountId, payload),
    onSuccess: (_movement, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treasury-accounts'] });
      queryClient.invalidateQueries({ queryKey: treasuryAccountQueryKey(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: treasuryMovementsQueryKey(variables.accountId, 'cash') });
    },
  });

  return { createMovement: mutation.mutate, isCreatingMovement: mutation.isPending };
};

export const useReconcileBankMovement = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({
      accountId,
      movementId,
      payload,
    }: {
      accountId: string;
      movementId: string;
      payload?: ReconcileTreasuryMovementPayload;
    }) => reconcileBankMovement(accountId, movementId, payload),
    onSuccess: (_movement, variables) => {
      queryClient.invalidateQueries({ queryKey: treasuryMovementsQueryKey(variables.accountId, 'bank') });
    },
  });

  return { reconcileMovement: mutation.mutate, isReconcilingMovement: mutation.isPending };
};
