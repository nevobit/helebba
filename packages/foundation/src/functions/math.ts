export function percent(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function progress(current: number, total: number): { ratio: number; percent: number } {
  if (total <= 0) return { ratio: 0, percent: 0 };
  const ratio = Math.min(Math.max(current / total, 0), 1);
  return { ratio, percent: ratio * 100 };
}

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

export function mode(values: readonly number[]): number[] {
  if (values.length === 0) return [];
  const freq = new Map<number, number>();
  for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
  const max = Math.max(...freq.values());
  return [...freq.entries()].filter(([, c]) => c === max).map(([v]) => v);
}

export function variance(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sq = values.reduce((acc, v) => acc + (v - mean) ** 2, 0);
  return sq / values.length;
}

export function stdDev(values: readonly number[]): number {
  return Math.sqrt(variance(values));
}
