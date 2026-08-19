import { api } from '@/shared/api';
import type { User } from '@hlb/contracts';

export type VerifyCodeInput = {
  code: string;
  user: Partial<User> & { email: string };
};

export type VerifyCodeResponse = {
  token: string;
  refreshToken: string;
  user: User;
};

export const login = async (email: string) => {
  const { data } = await api.post('/auth/otp/login', {
    email,
  });

  return data;
};

export const loginGoogle = async (code: string) => {
  const { data } = await api.post('/auth/oauth/google', {
    code,
  });

  return data;
};

export const verifyCode = async ({ code, user }: VerifyCodeInput) => {
  const { data } = await api.post<VerifyCodeResponse>('/auth/otp/verify', {
    code,
    user,
  });

  return data;
};

export const signup = async (email: string) => {
  const { data } = await api.post('/auth/otp/signup', {
    email,
  });

  return data;
};

export const refreshSession = async (refreshToken: string) => {
  const { data } = await api.post<{
    token: string;
    refreshToken: string;
    expiresAt?: string;
  }>('/auth/refresh', { refreshToken });

  return data;
};

export const logoutSession = async (all = false) => {
  const { data } = await api.post<{ ok: boolean; revokedCount?: number }>('/auth/logout', {
    all,
  });

  return data;
};
