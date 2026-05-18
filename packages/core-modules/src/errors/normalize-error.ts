export type ErrorLike = {
  name?: unknown;
  message?: unknown;
  stack?: unknown;
  statusCode?: unknown;
  code?: unknown;
};

export const asError = (err: unknown): Error => {
  if (err instanceof Error) return err;
  const e = err as ErrorLike;
  const message = typeof e?.message === 'string' ? e.message : 'Unknown error';
  const wrapped = new Error(message);
  if (typeof e?.name === 'string') wrapped.name = e.name;
  if (typeof e?.stack === 'string') wrapped.stack = e.stack;
  return wrapped;
};

export const getStatusCode = (err: unknown): number => {
  const e = err as ErrorLike;
  const statusCode = typeof e?.statusCode === 'number' ? e.statusCode : undefined;
  return statusCode && statusCode >= 400 ? statusCode : 500;
};
