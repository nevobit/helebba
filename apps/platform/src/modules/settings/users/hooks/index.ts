import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  inviteUser,
  organizationUsers,
  resendInvitation,
  revokeInvitation,
  roles,
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
