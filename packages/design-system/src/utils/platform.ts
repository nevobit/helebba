export const isWeb = typeof document !== 'undefined' && typeof window !== 'undefined';
export const isNative =
  typeof navigator !== 'undefined' &&
  (navigator as unknown as { product?: string }).product === 'ReactNative';

export const canUseDOM = isWeb;
