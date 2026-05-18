export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function round(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

export function avg(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
