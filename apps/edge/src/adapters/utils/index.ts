import os from 'node:os';
import { MonoContext } from '@hlb/core-modules';

export interface ServiceMeta {
  name: string;
  version: string;
  host: string;
  env: string | undefined;
  uptime: number;
  timestamp: string;
}

export const getServiceMeta = (): ServiceMeta => {
  return {
    name: MonoContext.getStateValue('name') as string,
    version: MonoContext.getStateValue('version') as string,
    host: os.hostname(),
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
};
