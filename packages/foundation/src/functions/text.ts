export function capitalize(input: string): string {
  if (!input) return '';
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function camelCase(input: string): string {
  const words = input
    .replace(/[_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase()
    .split(/\s+/);
  if (words.length === 0) return '';
  return (
    words[0] +
    words
      .slice(1)
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join('')
  );
}

export function snakeCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s]+/g, '_')
    .toLowerCase()
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function kebabCase(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

export async function hashString(
  input: string,
  algorithm: 'SHA-256' | 'SHA-1' | 'SHA-384' | 'SHA-512' = 'SHA-256',
): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const enc = new TextEncoder().encode(input);
    const buf = await globalThis.crypto.subtle.digest(algorithm, enc);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  try {
    const { createHash } = await import('crypto');
    return createHash(algorithm.replace('-', '').toLowerCase()).update(input).digest('hex');
  } catch {
    throw new Error('No crypto available to hash string');
  }
}
