export type ApiKeyStatus = 'active' | 'revoked';

export type ApiKeyRecord = {
  id: string;
  status: ApiKeyStatus;
  scopes: string[];
  products: string[];
};

export type ApiKeyRepository = {
  findByHash: (hashHex: string) => Promise<ApiKeyRecord | null>;
};

export type Cache = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttlSeconds: number) => Promise<void>;
};

export type RateLimiter = {
  allow: (key: string, windowMs: number, limit: number) => Promise<boolean>;
};

export type NonceStore = {
  firstSeen: (nonce: string, ttlMs: number) => Promise<boolean>;
};
