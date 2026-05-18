export function parseEnvNumber(
  key: string,
  source: Record<string, string | undefined> = process.env,
  required = true,
): number | null {
  const raw = source[key];
  if (raw == null || raw.trim() === '') {
    if (required) throw new Error(`Missing env number: ${key}`);
    return null;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    if (required) throw new Error(`Invalid env number: ${key}="${raw}"`);
    return null;
  }
  return n;
}

export function parseEnvBoolean(
  key: string,
  source: Record<string, string | undefined> = process.env,
  required = true,
): boolean | null {
  const raw = source[key];
  if (raw == null || raw.trim() === '') {
    if (required) throw new Error(`Missing env boolean: ${key}`);
    return null;
  }
  const v = raw.toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  if (required) throw new Error(`Invalid env boolean: ${key}="${raw}"`);
  return null;
}

export async function safeRequire<T>(modulePath: string, fallback: T | (() => T)): Promise<T> {
  try {
    const mod: unknown = await import(/* @vite-ignore */ modulePath);

    const hasDefault = <U>(m: unknown): m is { default: U } =>
      typeof m === 'object' && m !== null && 'default' in (m as Record<string, unknown>);

    if (hasDefault<T>(mod)) {
      return mod.default;
    }
    return mod as T;
  } catch {
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
}

export function memoize<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const cache = new Map<string, R>();
  return (...args: A) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
