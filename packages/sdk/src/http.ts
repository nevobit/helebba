import type { HelebbaClientOptions, ListParams } from './types';

type RequestOptions = {
  query?: ListParams;
};

export type HelebbaApiError = Error & {
  status: number;
  body: unknown;
};

export const createHelebbaApiError = (
  message: string,
  status: number,
  body: unknown,
): HelebbaApiError => {
  const error = new Error(message) as HelebbaApiError;
  error.name = 'HelebbaApiError';
  error.status = status;
  error.body = body;
  return error;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const DEFAULT_BASE_URL = 'https://api.helebba.com/api/v1';

const appendQuery = (url: URL, query: ListParams | undefined) => {
  if (!query) return;

  if (query.page !== undefined) url.searchParams.set('page', String(query.page));
  if (query.limit !== undefined) url.searchParams.set('limit', String(query.limit));
  if (query.search) url.searchParams.set('search', query.search);
};

export type HttpClient = {
  get: <T>(path: string, options?: RequestOptions) => Promise<T>;
};

export const createHttpClient = (options: HelebbaClientOptions): HttpClient => {
  if (!options.apiKey) throw new Error('Helebba SDK requires apiKey');

  const apiKey = options.apiKey;
  const baseUrl = trimTrailingSlash(options.baseUrl ?? DEFAULT_BASE_URL);
  const fetcher = options.fetcher ?? fetch;

  return {
    get: async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
      const url = new URL(`${baseUrl}${path}`);
      appendQuery(url, options.query);

      const timestamp = Date.now().toString();

      const response = await fetcher(url, {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          'x-timestamp': timestamp,
          'x-path': url.pathname,
          'x-client-user-agent': 'GSDK/0.1.0 (node)',
          Accept: 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') ?? '';
      const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          typeof body === 'object' && body && 'message' in body
            ? String((body as { message: unknown }).message)
            : `Helebba API request failed with status ${response.status}`;

        throw createHelebbaApiError(message, response.status, body);
      }

      return body as T;
    },
  };
};
