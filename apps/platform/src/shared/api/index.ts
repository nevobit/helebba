import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import SHA256 from 'crypto-js/sha256';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import { useSession } from '../state-manager';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const SIGNING_SECRET = import.meta.env.VITE_SIGNING_SECRET;

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const getBodyAsString = (data: unknown) => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
};

api.interceptors.request.use((config) => {
  const token = useSession.getState().token;
  if (token && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  const method = (config.method ?? 'GET').toUpperCase();
  const url = new URL(config.url ?? '', config.baseURL ?? window.location.origin);
  const path = url.pathname;
  const fullPath = `/api/v1${path}`;

  const timestamp = Date.now().toString();
  const body = getBodyAsString(config.data);
  const bodyHash = SHA256(body).toString();

  const signingPayload = [method, fullPath, timestamp, bodyHash].join('\n');

  const signature = HmacSHA256(signingPayload, SIGNING_SECRET).toString();

  config.headers['api-key'] = API_KEY;
  config.headers.set('x-timestamp', timestamp);
  config.headers.set('x-path', fullPath);
  config.headers.set('x-signature', signature);

  config.headers.set('x-client-user-agent', 'Portal/1.0.0 (web)');

  if (body && typeof config.data !== 'string') {
    config.data = body;
  }

  return config;
});

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const flushQueue = (token: string | null) => {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
};

const tryRefreshToken = async (): Promise<string | null> => {
  const { refreshToken } = useSession.getState();
  if (!refreshToken) return null;

  const { data } = await api.post<{ token: string; refreshToken: string; expiresAt?: string }>(
    '/auth/refresh',
    { refreshToken },
  );

  useSession.getState().setSessionTokens({
    token: data.token,
    refreshToken: data.refreshToken,
    accessExp: data.expiresAt,
  });

  return data.token;
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<unknown>) => {
    const original = error.config as RetriableRequest | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && original.url !== '/auth/refresh') {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (!token) {
              reject(new Error('Sesión expirada'));
              return;
            }
            original.headers.set('Authorization', `Bearer ${token}`);
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const token = await tryRefreshToken();
        flushQueue(token);

        if (!token) {
          useSession.getState().signOut();
          return Promise.reject(new Error('Sesión expirada'));
        }

        original.headers.set('Authorization', `Bearer ${token}`);
        return api(original);
      } catch (refreshError) {
        flushQueue(null);
        useSession.getState().signOut();
        return Promise.reject(refreshError instanceof Error ? refreshError : new Error('Sesión expirada'));
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401) {
      useSession.getState().signOut();
    }

    const msg =
      (error.response?.data as Record<string, unknown>)?.message ||
      error.message ||
      `HTTP ${error.response?.status ?? 'ERR'}`;
    return Promise.reject(new Error(msg as string));
  },
);