import type { User, Organization } from '@hlb/contracts';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type SessionState = {
  globalToken: string | null;
  token: string | null;
  refreshToken: string | null;

  accessExp?: string;

  user: User | null;

  organization: Partial<Organization> | null;
  activeMembershipId?: string;
  roleId?: string;

  status?: 'auth' | 'unauth';

  signIn: (p: {
    user: User;
    globalToken: string;
    accessExp?: string;
    refreshToken: string;
  }) => void;

  signOut: () => void;
  changeAccount: () => void;

  setWorkspaceContext: (p: {
    workspaceToken: string;
    membershipId: string;
    organization: Partial<Organization>;
    refreshToken?: string;
    roleId?: string;
  }) => void;

  isAuthenticated: () => boolean;
};

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      token: null,
      globalToken: null,
      refreshToken: null,
      user: null,
      organization: null,

      signIn: ({ user, globalToken, accessExp, refreshToken }) => {
        set({
          user,
          globalToken,
          token: globalToken,
          accessExp,
          refreshToken,
          status: 'auth',
        });
      },

      setWorkspaceContext: ({
        workspaceToken,
        membershipId,
        organization,
        refreshToken,
        roleId,
      }) => {
        set({
          token: workspaceToken, // ahora token workspace
          activeMembershipId: membershipId,
          organization,
          refreshToken: refreshToken ?? get().refreshToken,
          roleId,
        });
      },

      signOut: () =>
        set({
          token: null,
          globalToken: null,
          refreshToken: null,
          organization: null,
          user: null,
          status: 'unauth',
          accessExp: undefined,
          activeMembershipId: undefined,
          roleId: undefined,
        }),
      changeAccount: () =>
        set({
          token: get().globalToken,
          organization: null,
          activeMembershipId: undefined,
          roleId: undefined,
        }),
      isAuthenticated: () => !!get().token && get().status === 'auth',
    }),
    {
      name: 'helebba/session',
      storage:
        typeof window !== 'undefined' ? createJSONStorage(() => window.localStorage) : undefined,
      partialize: (s) => ({
        token: s.token,
        globalToken: s.globalToken,
        refreshToken: s.refreshToken,
        accessExp: s.accessExp,
        organization: s.organization,
        user: s.user,
        activeMembershipId: s.activeMembershipId,
        roleId: s.roleId,
        status: s.status,
      }),
      version: 1,
    },
  ),
);
