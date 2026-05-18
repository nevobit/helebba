import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { ApiKeyRecord } from './api-key';

export type VerifyOk = { type: 'ok'; message?: string; code?: number };
export type VerifyErr = { type: 'error'; message?: string; code?: number };
export type VerifyResult = VerifyOk | VerifyErr;

const ALLOWED_PRODUCTS = [
  'GSDK',
  'Portal',
  'Admin',
  'Mobile',
  'Site',
  'CLI',
  'Graph',
  'Ops',
  'Worker',
  'Edge',
] as const;

const ALLOWED_PLATFORMS = ['web', 'node', 'rn', 'next', 'cli'] as const;

const PRODUCT_GROUP = ALLOWED_PRODUCTS.join('|');
const PLATFORM_GROUP = ALLOWED_PLATFORMS.join('|');
const VERSION_RE = '\\d+(?:\\.\\d+)*';
const UA_REGEX = new RegExp(
  `^(${PRODUCT_GROUP})/${VERSION_RE}\\s+\\((${PLATFORM_GROUP})(?:;[^)]*)?\\)$`,
  'i',
);

export type VerifyInput = {
  ip?: string;
  url: string; // can include query; we will normalize to pathname
  method: string;
  body: unknown;
  headers: Record<string, unknown>;
  protocol?: string;
};

export const VerifyCode = {
  OK: 0,

  MISSING_API_KEY: 1001,
  INVALID_API_KEY: 1002,
  FORBIDDEN: 1003,

  BAD_USER_AGENT: 1101,
  INVALID_SIGNATURE: 1102,
  BAD_REQUEST: 1103,
  MISSING_TIMESTAMP: 1104,
  SKEWED_TIMESTAMP: 1105,
  MISSING_PATH: 1106,
  PATH_MISMATCH: 1107,
  MISSING_SIGNATURE: 1108,

  RATE_LIMITED: 1201,
  REPLAY_NONCE: 1202,

  UPSTREAM_UNAVAILABLE: 1301,
} as const;

export type VerifyCode = (typeof VerifyCode)[keyof typeof VerifyCode];

type Checker = (
  input: VerifyInput,
  ctx: VerifyContext,
) => Promise<VerifyErr | null> | VerifyErr | null;

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000; // ±5 minutes
const TIMESTAMP_HEADER = 'x-timestamp';
const SIGNATURE_HEADER = 'x-signature';
const PATH_HEADER = 'x-path';
const NONCE_HEADER = 'x-nonce';
const API_KEY_HEADER = 'api-key';
const KEY_ID_HEADER = 'x-key-id'; // optional for key rotation
const CLIENT_UA_HEADER = 'x-client-user-agent';

export type VerifyDeps = {
  /**
   * API key lookup (recommended: store hashed api-key; never store raw).
   * Return null when invalid.
   */
  getApiKey: (apiKey: string) => Promise<ApiKeyRecord | null> | ApiKeyRecord | null;

  /**
   * Resolve signing secret by key id (kid). If you don't rotate, ignore kid and return single secret.
   * Return null when unknown/unavailable.
   */
  getSigningSecret: (params: {
    keyId?: string;
    apiKey?: ApiKeyRecord;
  }) => Promise<string | null> | string | null;

  /**
   * Anti-replay: return true only if nonce is first-seen (e.g. Redis SET NX).
   * If nonce is absent, we skip. If present and already used -> false.
   */
  nonceFirstSeen?: (nonce: string, ttlMs: number) => Promise<boolean> | boolean;

  /**
   * Rate limit: return true if allowed, false if limited.
   * Implement with Redis for multi-instance.
   */
  allowRequest?: (key: string, windowMs: number, limit: number) => Promise<boolean> | boolean;

  /**
   * Optional: compute body hash from raw body if you have it (best).
   * If not provided, we fallback to stableStringify(body).
   */
  getBodyHashHex?: (body: unknown) => string;

  /**
   * Clock function for testability.
   */
  nowMs?: () => number;
};

type VerifyContext = {
  apiKey: string;
  apiKeyRecord: ApiKeyRecord | null;
  keyId?: string;
  signingSecret: string | null;
};

const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_LIMIT = 100;
const DEFAULT_NONCE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function sha256Hex(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

function hmacSha256Hex(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function constantTimeEquals(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, 'utf8');
    const bb = Buffer.from(b, 'utf8');
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

function stableStringify(value: unknown): string {
  if (value === undefined) return '';
  if (value === null) return 'null';
  if (typeof value !== 'object') return JSON.stringify(value);

  const seen = new WeakSet<object>();
  const stringify = (v: unknown): string => {
    if (v === null) return 'null';
    const t = typeof v;
    if (t === 'string') return JSON.stringify(v);
    if (t === 'number') return Number.isFinite(v as number) ? String(v) : 'null';
    if (t === 'boolean') return v ? 'true' : 'false';
    if (t !== 'object') return 'null';

    const obj = v as Record<string, unknown>;
    if (Array.isArray(obj)) return `[${obj.map((x) => stringify(x)).join(',')}]`;
    if (seen.has(obj)) return '"[Circular]"';
    seen.add(obj);

    const keys = Object.keys(obj).sort();
    const entries = keys
      .filter((k) => obj[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${stringify(obj[k])}`);
    return `{${entries.join(',')}}`;
  };

  return stringify(value);
}

function headerString(headers: Record<string, unknown>, name: string): string {
  const v = headers[name] ?? headers[name.toLowerCase()];
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return String(v ?? '');
}

function headerOptional(headers: Record<string, unknown>, name: string): string | undefined {
  const s = headerString(headers, name).trim();
  return s ? s : undefined;
}

function parseIntMs(value: unknown): number | null {
  const s = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normalizePath(url: string): string {
  // Accept pathname or full URL; normalize to pathname (no query)
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new URL(url).pathname || '/';
    }
    // If it includes query, strip it
    const q = url.indexOf('?');
    return (q >= 0 ? url.slice(0, q) : url) || '/';
  } catch {
    return url || '/';
  }
}

/**
 * method \n path \n timestamp \n sha256(body)
 */
function buildSigningPayload(params: {
  method: string;
  path: string;
  timestampMs: number;
  bodyHashHex: string;
}): string {
  return `${params.method.toUpperCase()}\n${params.path}\n${String(params.timestampMs)}\n${params.bodyHashHex}`;
}

// ---------------- Checks ----------------

const requireApiKey: Checker = async (input, ctx) => {
  const apiKey = headerOptional(input.headers, API_KEY_HEADER);
  if (!apiKey)
    return { type: 'error', code: VerifyCode.MISSING_API_KEY, message: 'Missing api-key header' };
  if (apiKey.length < 20)
    return { type: 'error', code: VerifyCode.INVALID_API_KEY, message: 'Malformed API key' };

  ctx.apiKeyRecord = await ctxDeps.getApiKey(apiKey); // set in wrapper
  console.log('API Key Record:', ctx.apiKeyRecord);
  if (!ctx.apiKeyRecord || ctx.apiKeyRecord.status !== 'active') {
    return { type: 'error', code: VerifyCode.INVALID_API_KEY, message: 'Invalid API key' };
  }

  return null;
};

const requireUserAgent: Checker = (input) => {
  const ua =
    headerOptional(input.headers, 'user-agent') ?? headerOptional(input.headers, 'User-Agent');
  const xua = headerOptional(input.headers, CLIENT_UA_HEADER);
  const agent = (xua ?? ua)?.trim();

  if (!agent) {
    return { type: 'error', code: VerifyCode.BAD_USER_AGENT, message: 'Missing User-Agent' };
  }
  if (!UA_REGEX.test(agent)) {
    return {
      type: 'error',
      code: VerifyCode.BAD_USER_AGENT,
      message: 'Invalid User-Agent format. Expected: Product/Version (platform[; extras]).',
    };
  }
  return null;
};

const requireTimestamp: Checker = (input) => {
  const ts = parseIntMs(input.headers[TIMESTAMP_HEADER]);
  if (ts === null)
    return {
      type: 'error',
      code: VerifyCode.MISSING_TIMESTAMP,
      message: `Missing ${TIMESTAMP_HEADER}`,
    };

  const now = (ctxDeps.nowMs ?? Date.now)();
  const delta = Math.abs(now - ts);
  if (delta > MAX_CLOCK_SKEW_MS) {
    return {
      type: 'error',
      code: VerifyCode.SKEWED_TIMESTAMP,
      message: `Timestamp skew too large (±${MAX_CLOCK_SKEW_MS}ms)`,
    };
  }
  return null;
};

const requirePath: Checker = (input) => {
  const xPathRaw = headerOptional(input.headers, PATH_HEADER);
  if (!xPathRaw)
    return { type: 'error', code: VerifyCode.MISSING_PATH, message: `Missing ${PATH_HEADER}` };

  const xPath = normalizePath(xPathRaw);
  const actual = normalizePath(input.url);

  if (xPath !== actual) {
    return { type: 'error', code: VerifyCode.PATH_MISMATCH, message: 'X-Path mismatch' };
  }
  return null;
};

const verifyHmacSignature: Checker = async (input, ctx) => {
  const sigRaw = headerOptional(input.headers, SIGNATURE_HEADER);
  if (!sigRaw)
    return {
      type: 'error',
      code: VerifyCode.MISSING_SIGNATURE,
      message: `Missing ${SIGNATURE_HEADER}`,
    };

  const ts = parseIntMs(input.headers[TIMESTAMP_HEADER]);
  if (ts === null)
    return {
      type: 'error',
      code: VerifyCode.BAD_REQUEST,
      message: 'Cannot verify signature without timestamp',
    };

  const xPathRaw = headerOptional(input.headers, PATH_HEADER);
  if (!xPathRaw)
    return {
      type: 'error',
      code: VerifyCode.BAD_REQUEST,
      message: 'Cannot verify signature without path',
    };

  // key rotation (optional)
  const keyId = headerOptional(input.headers, KEY_ID_HEADER);
  ctx.keyId = keyId;

  ctx.signingSecret = await ctxDeps.getSigningSecret({
    keyId,
    apiKey: ctx.apiKeyRecord ?? undefined,
  });
  if (!ctx.signingSecret) {
    return {
      type: 'error',
      code: VerifyCode.UPSTREAM_UNAVAILABLE,
      message: 'Signing secret unavailable',
    };
  }

  const cleanSig = sigRaw.startsWith('sha256=') ? sigRaw.slice('sha256='.length) : sigRaw;

  const bodyHashHex =
    ctxDeps.getBodyHashHex?.(input.body) ?? sha256Hex(stableStringify(input.body));

  const payload = buildSigningPayload({
    method: input.method,
    path: normalizePath(xPathRaw),
    timestampMs: ts,
    bodyHashHex,
  });

  console.log('SIGNATUE', ctx.signingSecret);
  const expected = hmacSha256Hex(payload, ctx.signingSecret);
  const ok = constantTimeEquals(cleanSig, expected);

  if (!ok)
    return { type: 'error', code: VerifyCode.INVALID_SIGNATURE, message: 'Invalid signature' };
  return null;
};

const checkNonceIfPresent =
  (ttlMs = DEFAULT_NONCE_TTL_MS): Checker =>
  async (input) => {
    const nonce = headerOptional(input.headers, NONCE_HEADER);
    if (!nonce) return null;

    if (!ctxDeps.nonceFirstSeen) {
      // If you enable nonce header, you MUST provide a store.
      return { type: 'error', code: VerifyCode.BAD_REQUEST, message: 'Server missing nonce store' };
    }

    const ok = await ctxDeps.nonceFirstSeen(nonce, ttlMs);
    if (!ok)
      return {
        type: 'error',
        code: VerifyCode.REPLAY_NONCE,
        message: 'Replay detected (nonce reused)',
      };

    return null;
  };

const checkRateLimit =
  (windowMs = DEFAULT_WINDOW_MS, limit = DEFAULT_LIMIT): Checker =>
  async (input, ctx) => {
    if (!ctxDeps.allowRequest) return null; // optional

    const key = headerOptional(input.headers, API_KEY_HEADER) ?? input.ip;
    if (!key) return null;

    const ok = await ctxDeps.allowRequest(String(key), windowMs, limit);
    if (!ok)
      return { type: 'error', code: VerifyCode.RATE_LIMITED, message: 'Rate limit exceeded' };

    return null;
  };

// --- dependency wiring (no global state)
let ctxDeps: VerifyDeps;

// ---------------- Public API ----------------

export type VerifierOptions = {
  /**
   * Enable/disable certain checks depending on route patterns.
   * Keep it simple; the Fastify gate already handles skips.
   */
  shouldVerify?: (input: VerifyInput) => boolean;

  /**
   * Customize check order or enable/disable checks.
   */
  checks?: Checker[];
};

export const createVerifier = (deps: VerifyDeps, opts: VerifierOptions = {}) => {
  ctxDeps = deps;

  const checks: Checker[] = opts.checks ?? [
    requireApiKey,
    requireUserAgent,
    requireTimestamp,
    requirePath,
    verifyHmacSignature,
    checkNonceIfPresent(),
    checkRateLimit(),
  ];

  return async (input: VerifyInput): Promise<VerifyResult> => {
    if (opts.shouldVerify && !opts.shouldVerify(input)) {
      return { type: 'ok', code: VerifyCode.OK };
    }

    const apiKey = headerOptional(input.headers, API_KEY_HEADER);
    console.log(apiKey);
    const ctx: VerifyContext = {
      apiKey: apiKey ?? '',
      apiKeyRecord: null,
      keyId: undefined,
      signingSecret: null,
    };

    for (const check of checks) {
      const res = await Promise.resolve(check(input, ctx));
      if (res) return res;
    }

    return { type: 'ok', code: VerifyCode.OK };
  };
};
