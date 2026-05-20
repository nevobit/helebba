import fp from 'fastify-plugin';
import type { BuildAppOpts } from '../../server/types';
import { getErrorMessage, getPathname, withTimeout } from '../observability';
import { buildVerifier } from './verifier';
import { mapVerifyCode } from '@hlb/security';

const verify = await buildVerifier();

export const verifyGatePlugin = fp<BuildAppOpts>(
  async (app, opts) => {
    const HEALTH_PATH = '/api/v1/health';
    const READY_PATH = '/-/ready';

    const SKIP_EXACT = new Set([HEALTH_PATH, READY_PATH, '/docs', '/docs/json', '/docs/yaml']);
    const SKIP_PREFIXES = ['/docs'];

    app.addHook('preValidation', async (req, reply) => {
      console.log('URL', req.url);
      const pathname = getPathname(req.url);

      if (SKIP_EXACT.has(pathname)) return;
      if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return;

      const TIMEOUT_MS = 3000;

      try {
        const result = await withTimeout(
          verify({
            url: pathname,
            body: req.body,
            headers: req.headers as Record<string, unknown>,
            protocol: req.protocol,
            method: req.method,
          }),
          TIMEOUT_MS,
          'verify_timeout',
        );

        if (result && result.type === 'error') {
          const status = mapVerifyCode(result.code);

          console.log({ pathname });
          opts.logger?.warn('Verification failed', {
            requestId: req.id,
            status,
            reason: result.message,
            path: pathname,
          });

          return reply
            .code(status)
            .type('application/json')
            .send({
              type: result.type ?? 'auth_error',
              title: status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : 'Bad Request',
              status,
              detail: result.message ?? 'Verification failed',
              instance: pathname,
              requestId: req.id,
            });
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        const isTimeout = msg === 'verify_timeout';
        const status = isTimeout ? 504 : 500;

        opts.logger?.error('Verification crash', {
          requestId: req.id,
          path: pathname,
          err: isTimeout ? 'verify_timeout' : msg,
        });

        return reply
          .code(status)
          .type('application/json')
          .send({
            type: isTimeout ? 'verify_timeout' : 'verify_crash',
            title: isTimeout ? 'Gateway Timeout' : 'Internal Server Error',
            status,
            detail: isTimeout ? 'Verification timed out' : 'Verification threw an error',
            instance: pathname,
            requestId: req.id,
          });
      }
    });
  },
  { name: 'verify-gate' },
);
