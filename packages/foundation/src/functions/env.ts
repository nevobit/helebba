export type EnvSpec<T> = {
  [K in keyof T]-?: { key: string; parse: (raw: string) => T[K] };
};

// export function loadEnv<T>(
//   spec: EnvSpec<T>,
//   source: Record<string, string | undefined> = process.env,
// ): T {
//   const out = {} as T;
//   for (const k in spec) {
//     const { key, parse } = spec[k];
//     const raw = source[key];
//     if (raw === undefined || raw.trim() === '') {
//       throw new Error(`Missing required env: ${key}`);
//     }
//     out[k] = parse(raw);
//   }
//   return out;
// }

export const asString = (v: string) => v;
export const asInt = (v: string) => {
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`Expected integer, got "${v}"`);
  return n;
};
export const asBoolean = (v: string) => {
  const s = v.toLowerCase();
  if (s === 'true' || s === '1') return true;
  if (s === 'false' || s === '0') return false;
  throw new Error(`Expected boolean, got "${v}"`);
};
