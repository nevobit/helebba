export function ms(seconds: number): number {
  return seconds * 1000;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export function since(date: Date | number): number {
  const t = typeof date === 'number' ? date : date.getTime();
  return Date.now() - t;
}
