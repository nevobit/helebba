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

    BASE_DOMAIN: str({ default: 'helebba.com' }),

    RESEND_API_KEY: str(),
    EMAIL_FROM: str({ default: 'Helebba <no-reply@lytos.app>' }),
    EMAIL_REPLY_TO: str({ default: '' }),
    EMAIL_ASSETS_BASE_URL: str({ default: 'http://localhost:5174' }),

    API_KEY_PEPPER: str(),
    API_HMAC_SECRET: str(),
    DEV_API_KEYS: str({ default: '' }),

    STORAGE_PROVIDER: str({ choices: ['aws-s3', 'cloudinary'], default: 'cloudinary' }),

    AWS_REGION: str({ default: 'us-east-1' }),
    AWS_ACCESS_KEY_ID: str({ default: '' }),
    AWS_SECRET_ACCESS_KEY: str({ default: '' }),
    AWS_S3_BUCKET: str({ default: '' }),
    AWS_S3_PUBLIC_BASE_URL: str({ default: '' }),

    CLOUDINARY_CLOUD_NAME: str({ default: '' }),
    CLOUDINARY_API_KEY: str({ default: '' }),
    CLOUDINARY_API_SECRET: str({ default: '' }),

    REDIS_URL: str(),
    MONGODB_URI: str(),
  });
};
