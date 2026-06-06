import os from 'node:os';
import { MonoContext } from '@hlb/kernel';
import type { ServiceMeta } from '@hlb/contracts';

export const getServiceMeta = (): ServiceMeta => {
  const name = String(MonoContext.getStateValue('name') ?? 'unknown-service');
  const version = String(MonoContext.getStateValue('version') ?? '0.0.0');

  return {
    name,
    version,
    host: os.hostname(),
    env: process.env.NODE_ENV,
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  };
};
