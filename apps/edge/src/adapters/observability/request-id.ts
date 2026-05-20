import * as crypto from "node:crypto";
import { URL } from "node:url";

export const safeString = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

export const getPathname = (rawUrl: string): string => {
  try {
    return new URL(rawUrl, "http://localhost").pathname;
  } catch {
    const q = rawUrl.indexOf("?");
    return q >= 0 ? rawUrl.slice(0, q) : rawUrl;
  }
};

export const genRequestIdFromHeaders = (headers: Record<string, unknown>): string => {
  const raw = headers["x-request-id"] ?? headers["x-correlation-id"];

  const headerId =
    typeof raw === "string"
      ? safeString(raw)
      : Array.isArray(raw)
        ? safeString(raw[0])
        : undefined;

  return headerId ?? crypto.randomUUID();
};

export const withTimeout = async <T>(
  p: Promise<T>,
  ms: number,
  label: string,
): Promise<T> => {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeout = new Promise<never>((_, rej) => {
    timeoutId = setTimeout(() => rej(new Error(label)), ms);
  });

  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
};
