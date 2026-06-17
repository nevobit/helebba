import type { AxiosError, AxiosInstance } from 'axios';
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

  const timestamp = Date.now().toString();
  const body = getBodyAsString(config.data);
  const bodyHash = SHA256(body).toString();

  const signingPayload = [method, path, timestamp, bodyHash].join('\n');

  const signature = HmacSHA256(signingPayload, SIGNING_SECRET).toString();

  config.headers['api-key'] = API_KEY;
  config.headers.set('x-timestamp', timestamp);
  config.headers.set('x-path', `/api/v1${path}`);
  config.headers.set('x-signature', signature);

  config.headers.set('x-client-user-agent', 'Portal/1.0.0 (web)');

  if (body && typeof config.data !== 'string') {
    config.data = body;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<unknown>) => {
    if (err.response?.status === 401) {
      try {
        useSession.getState().signOut();
      } catch {
        throw new Error('Error');
      }
    }
    const msg =
      (err.response?.data as Record<string, unknown>)?.message ||
      err.message ||
      `HTTP ${err.response?.status ?? 'ERR'}`;
    return Promise.reject(new Error(msg as string));
  },
);
