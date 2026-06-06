import { cleanEnv, str, port } from 'envalid';

export type EdgeEnv = ReturnType<typeof loadEnv>;

export const loadEnv = () => {
  return cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
    ENVIRONMENT: str({ choices: ['dev', 'stg', 'prod'], default: 'dev' }),
    TZ: str({ default: 'America/Bogota' }),

    APP_NAME: str({ default: 'keystone-edge' }),
    APP_HOST: str({ default: '0.0.0.0' }),
    APP_PORT: port({ default: 8000 }),
    LOG_LEVEL: str({
      choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
      default: 'info',
    }),

    BASE_DOMAIN: str({ default: 'keystone.app' }),

    API_KEY_PEPPER: str(),
    API_HMAC_SECRET: str(),
    DEV_API_KEYS: str({ default: '' }),

    REDIS_URL: str({ default: '' }),
    PG_URI: str({
      default:
        'postgresql://neondb_owner:npg_rVXcgsUb1f6d@ep-billowing-shape-aid48ykg-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    }),
    MONGODB_URI: str({
      default:
        'mongodb+srv://nevobit_db_user:JLrTaX5rMwOGv7Fh@nevobit-dev-us-east-1.byw9vws.mongodb.net/helebba_pre?appName=nevobit-dev-us-east-1',
    }),
  });
};
