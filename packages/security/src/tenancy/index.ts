import type { TenantContext } from '@keystone/contracts';

export interface ResolveTenantOptions {
  readonly host?: string;
  readonly path?: string;
  readonly headers?: Record<string, unknown>;
  readonly baseDomain: string;
  readonly pathPrefix?: string;
  readonly apiPrefix?: string;
  readonly tenantHeaderName?: string;
  readonly reservedSubdomains?: readonly string[];
  readonly allowPathMode?: boolean;
  readonly allowHeaderMode?: boolean;
  readonly allowHostMode?: boolean;
}

const nowIso = (): TenantContext['resolvedAt'] =>
  new Date().toISOString() as TenantContext['resolvedAt'];

export const normalizeTenantSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
};

const getHeaderValue = (
  headers: Record<string, unknown> | undefined,
  name: string,
): string | undefined => {
  if (!headers) return undefined;

  const raw = headers[name] ?? headers[name.toLowerCase()];

  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }

  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0].trim()) {
    return raw[0].trim();
  }

  return undefined;
};

const stripPort = (host: string): string => host.split(':')[0] ?? host;

const resolveFromHeader = (options: ResolveTenantOptions): TenantContext | null => {
  if (!options.allowHeaderMode) return null;

  const headerName = options.tenantHeaderName ?? 'x-tenant';
  const value = getHeaderValue(options.headers, headerName);

  if (!value) return null;

  const tenantSlug = normalizeTenantSlug(value);
  if (!tenantSlug) return null;

  return {
    tenantSlug: tenantSlug as TenantContext['tenantSlug'],
    source: 'header',
    headerName,
    host: options.host,
    path: options.path,
    resolvedAt: nowIso(),
  };
};

const resolveFromHost = (options: ResolveTenantOptions): TenantContext | null => {
  if (!options.allowHostMode || !options.host) return null;

  const baseDomain = stripPort(options.baseDomain);
  const host = stripPort(options.host);

  if (host === baseDomain || !host.endsWith(`.${baseDomain}`)) {
    return null;
  }

  const subdomain = host.slice(0, host.length - `.${baseDomain}`.length);
  const firstSegment = subdomain.split('.')[0]?.trim().toLowerCase();

  if (!firstSegment) return null;

  const reserved = new Set(
    (options.reservedSubdomains ?? ['www', 'api', 'admin', 'docs']).map((item) =>
      item.toLowerCase(),
    ),
  );

  if (reserved.has(firstSegment)) {
    return null;
  }

  return {
    tenantSlug: firstSegment as TenantContext['tenantSlug'],
    source: 'host',
    host,
    path: options.path,
    resolvedAt: nowIso(),
  };
};

const resolveFromPath = (options: ResolveTenantOptions): TenantContext | null => {
  if (!options.allowPathMode || !options.path) return null;

  const pathPrefix = options.pathPrefix ?? '/w';
  const apiPrefix = options.apiPrefix ?? '/api';
  const pathname = options.path.split('?')[0] ?? options.path;

  if (pathname.startsWith(apiPrefix)) {
    return null;
  }

  const normalizedPrefix = pathPrefix.startsWith('/') ? pathPrefix : `/${pathPrefix}`;
  if (!pathname.startsWith(normalizedPrefix)) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const prefixSegment = normalizedPrefix.replace('/', '');
  const prefixIndex = segments.findIndex((segment) => segment === prefixSegment);

  if (prefixIndex < 0) return null;

  const candidate = segments[prefixIndex + 1];
  if (!candidate) return null;

  const tenantSlug = normalizeTenantSlug(candidate);
  if (!tenantSlug) return null;

  return {
    tenantSlug: tenantSlug as TenantContext['tenantSlug'],
    source: 'path',
    host: options.host,
    path: pathname,
    resolvedAt: nowIso(),
  };
};

export const resolveTenantContext = (options: ResolveTenantOptions): TenantContext => {
  return (
    resolveFromHeader(options) ??
    resolveFromHost(options) ??
    resolveFromPath(options) ?? {
      source: 'unknown',
      host: options.host,
      path: options.path,
      resolvedAt: nowIso(),
    }
  );
};

export const assertTenantContext = (
  context: TenantContext,
  message = 'Tenant is required',
): TenantContext & { tenantSlug: NonNullable<TenantContext['tenantSlug']> } => {
  if (!context.tenantSlug) {
    const error = new Error(message) as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  return context as TenantContext & {
    tenantSlug: NonNullable<TenantContext['tenantSlug']>;
  };
};
