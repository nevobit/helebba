export function createId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rnd}`;
}

function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function uuid7(): string {
  const timestamp = Date.now().toString(16).padStart(12, '0');

  const random = randomHex(10);

  return [
    timestamp.slice(0, 8),
    timestamp.slice(8, 12),
    `7${random.slice(0, 3)}`,
    `${((parseInt(random[3], 16) & 0x3) | 0x8).toString(16)}${random.slice(4, 7)}`,
    random.slice(7, 19),
  ].join('-');
}

export function uuid4(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}
