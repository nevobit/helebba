import 'dotenv/config';
import { ConsoleTransport, Logger, LoggerTransportName, MonoContext } from '@hlb/kernel';
import { buildApp } from './app';
import os from 'os';
import { version, name } from '../../package.json';
import type { Environment } from './types';
import { loadEnv } from './env';
import { buildApiPrefix } from '../adapters/versioning/api-versioning';
import { initDataSources } from '@hlb/data-sources';
import { setLogger, setMailer } from '@hlb/constant-definitions';
import { createMailer } from '@hlb/integrations';

type BuildServer = ReturnType<typeof buildApp>;

const consoleOptions = {
  transport: LoggerTransportName.CONSOLE,
  options: { destination: LoggerTransportName.CONSOLE, channelName: LoggerTransportName.CONSOLE },
};

const createLogger = (environment: Environment): Logger => {
  return new Logger({
    optionsByLevel: {
      debug: [consoleOptions],
      info: [consoleOptions],
      warn: [consoleOptions],
      error: [consoleOptions],
      fatal: [consoleOptions],
      all: [consoleOptions],
      raw: [consoleOptions],
    },
    transports: {
      [LoggerTransportName.CONSOLE]: ConsoleTransport,
    },
    appIdentifiers: {
      region: process.env.REGION,
      hostname: os.hostname(),
      app: name,
      version,
      environment,
      developer: os.userInfo().username,
    },
    catchTransportErrors: true,
    logLevel: 'all',
  });
};

MonoContext.setState({ name, version, secret: null });

const main = async (): Promise<void> => {
  const env = loadEnv();
  const logger = createLogger(env.ENVIRONMENT);

  setLogger(logger);
  setMailer(
    createMailer({
      provider: 'resend',
      from: env.EMAIL_FROM,
      replyTo: env.EMAIL_REPLY_TO,
      RESEND_API_KEY: env.RESEND_API_KEY,
    }),
  );

  await initDataSources({
    mongoose: {
      mongoUri: env.MONGODB_URI,
    },
    redisdb: {
      redisReadUrl: env.REDIS_URL,
      redisWriteUrl: env.REDIS_URL,
    },
  });

  const server: BuildServer = buildApp({
    logger,
    environment: env.ENVIRONMENT as Environment,
    baseDomain: env.BASE_DOMAIN,
    pathPrefix: buildApiPrefix({ version: 'v1' }),
  });

  const startPromise = server.listen({ host: env.APP_HOST, port: env.APP_PORT });
  try {
    const address = await startPromise;
    logger.all(`Server successfully started on: ${address}`, { address });
    logger.info('Press CTRL-C to stop');
  } catch (err) {
    logger.fatal('Error starting server:', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
    process.exit(1);
  }
};

void main();
