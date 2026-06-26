import type { HelebbaClientOptions, ListParams } from './types';

type RequestOptions = {
  query?: ListParams;
};

type TokenResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
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

const readBody = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json') ? await response.json() : await response.text();
};

const assertOk = async (response: Response) => {
  const body = await readBody(response);

  if (!response.ok) {
    const message =
      typeof body === 'object' && body && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Helebba API request failed with status ${response.status}`;

    throw createHelebbaApiError(message, response.status, body);
  }

  return body;
};

export const createHttpClient = (options: HelebbaClientOptions): HttpClient => {
  if (!options.apiKey) throw new Error('Helebba SDK requires apiKey');

  const apiKey = options.apiKey;
  const baseUrl = trimTrailingSlash(options.baseUrl ?? DEFAULT_BASE_URL);
  const fetcher = options.fetcher ?? fetch;
  let cachedToken: { accessToken: string; expiresAt: number } | null = null;
  let tokenRequest: Promise<string> | null = null;

  const requestAccessToken = async () => {
    if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.accessToken;
    if (tokenRequest) return tokenRequest;

    tokenRequest = (async () => {
      try {
        const tokenUrl = new URL(`${baseUrl}/sdk/token`);
        const timestamp = Date.now().toString();
        const response = await fetcher(tokenUrl, {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'x-timestamp': timestamp,
            'x-path': tokenUrl.pathname,
            'x-client-user-agent': 'GSDK/0.1.0 (node)',
            Accept: 'application/json',
          },
        });
        const token = (await assertOk(response)) as TokenResponse;
        const safetyWindowSeconds = 30;

        cachedToken = {
          accessToken: token.accessToken,
          expiresAt: Date.now() + Math.max(0, token.expiresIn - safetyWindowSeconds) * 1000,
        };

        return cachedToken.accessToken;
      } finally {
        tokenRequest = null;
      }
    })();

    return tokenRequest;
  };

  return {
    get: async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
      const url = new URL(`${baseUrl}${path}`);
      appendQuery(url, options.query);
      const accessToken = await requestAccessToken();

      const response = await fetcher(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'x-client-user-agent': 'GSDK/0.1.0 (node)',
          Accept: 'application/json',
        },
      });

      return (await assertOk(response)) as T;
    },
  };
};
