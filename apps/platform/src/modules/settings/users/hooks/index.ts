import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiKeys,
  createApiKey,
  createRole,
  inviteUser,
  organizationUsers,
  revokeApiKey,
  resendInvitation,
  revokeInvitation,
  roles,
  type CreateExternalApiKeyPayload,
  type CreateRolePayload,
  type InviteUserPayload,
} from '../services';

export const useOrganizationUsers = () => {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['organization-users'],
    queryFn: organizationUsers,
  });

  return {
    users: data?.items ?? [],
    error,
    isFetching,
    isLoading,
    refetch,
  };
};

export const useRoles = () => {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: roles,
  });

  return {
    roles: data?.items ?? [],
    error,
    isFetching,
    isLoading,
    refetch,
  };
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  return {
    createRole: mutation.mutate,
    isCreatingRole: mutation.isPending,
  };
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: InviteUserPayload) => inviteUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-users'] });
    },
  });

  return {
    inviteUser: mutation.mutate,
    isInvitingUser: mutation.isPending,
  };
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (membershipId: string) => resendInvitation(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-users'] });
    },
  });

  return {
    resendInvitation: mutation.mutate,
    resendingInvitationId: mutation.variables,
    isResendingInvitation: mutation.isPending,
  };
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (membershipId: string) => revokeInvitation(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-users'] });
    },
  });

  return {
    revokeInvitation: mutation.mutate,
    revokingInvitationId: mutation.variables,
    isRevokingInvitation: mutation.isPending,
  };
};

export const useApiKeys = () => {
  const { data, error, isFetching, isLoading, refetch } = useQuery({
    queryKey: ['api-keys'],
    queryFn: apiKeys,
  });

  return {
    apiKeys: data ?? [],
    error,
    isFetching,
    isLoading,
    refetch,
  };
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: CreateExternalApiKeyPayload) => createApiKey(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  return {
    createApiKey: mutation.mutate,
    createdApiKey: mutation.data,
    resetCreatedApiKey: mutation.reset,
    isCreatingApiKey: mutation.isPending,
  };
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (apiKeyId: string) => revokeApiKey(apiKeyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  return {
    revokeApiKey: mutation.mutate,
    revokingApiKeyId: mutation.variables,
    isRevokingApiKey: mutation.isPending,
  };
};
