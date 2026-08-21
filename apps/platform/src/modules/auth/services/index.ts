import { api } from '@/shared/api';
import type { User } from '@hlb/contracts';

export type VerifyCodeInput = {
  code: string;
  user: Partial<User> & { email: string };
  rememberMe?: boolean;
};

export type VerifyCodeResponse = {
  token: string;
  refreshToken: string;
  user: User;
};

export const login = async (input: { email: string; rememberMe?: boolean }) => {
  const { data } = await api.post('/auth/otp/login', {
    email: input.email,
    rememberMe: input.rememberMe ?? false,
  });

  return data;
};

export const loginGoogle = async (code: string) => {
  const { data } = await api.post('/auth/oauth/google', {
    code,
  });

  return data;
};

export const loginApple = async (code: string) => {
  const { data } = await api.post('/auth/oauth/apple', {
    code,
  });

  return data;
};

export const verifyCode = async ({ code, user, rememberMe }: VerifyCodeInput) => {
  const { data } = await api.post<VerifyCodeResponse>('/auth/otp/verify', {
    code,
    user,
    rememberMe: rememberMe ?? false,
  });

  return data;
};

export const signup = async (input: { email: string; rememberMe?: boolean }) => {
  const { data } = await api.post('/auth/otp/signup', {
    email: input.email,
    rememberMe: input.rememberMe ?? false,
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
