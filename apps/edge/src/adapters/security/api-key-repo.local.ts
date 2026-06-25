import { hashApiKey } from '@hlb/security';
import type { ApiKeyRepository, ApiKeyRecord } from '@hlb/security';

type Seed = {
  rawKey: string;
  record: ApiKeyRecord;
};

const parseSeed = (): Seed[] => {
  // Formato:
  // DEV_API_KEYS="key1:id=dev1,organizationId=org1,scopes=*,products=Edge;key2:id=dev2,scopes=inventory:read,products=GSDK"
  const raw = process.env.DEV_API_KEYS ?? '';
  if (!raw.trim()) return [];

  return raw.split(';').map((entry) => {
    const [rawKeyPart, metaPart] = entry.split(':');
    const rawKey = (rawKeyPart ?? '').trim();
    const meta = (metaPart ?? '').trim();

    const kv = new Map(
      meta
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const i = p.indexOf('=');
          return i >= 0 ? [p.slice(0, i).trim(), p.slice(i + 1).trim()] : [p.trim(), ''];
        }),
    );

    const id = kv.get('id') || 'dev';
    const scopes = (kv.get('scopes') || '').split('|').filter(Boolean);
    const products = (kv.get('products') || '').split('|').filter(Boolean);
    const organizationId = kv.get('organizationId') || undefined;

    const record: ApiKeyRecord = {
      id,
      status: 'active',
      scopes: scopes.length ? scopes : ['*'],
      products: products.length ? products : ['Edge'],
      organizationId,
    };

    return { rawKey, record };
  });
};

export const localApiKeyRepo = (): ApiKeyRepository => {
  const seeds = parseSeed();

  const byHash = new Map<string, ApiKeyRecord>();
  for (const s of seeds) {
    if (!s.rawKey) continue;
    const hash = hashApiKey(s.rawKey);
    byHash.set(hash, s.record);
  }

  return {
    findByHash: async (hashHex) => byHash.get(hashHex) ?? null,
  };
};
