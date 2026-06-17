import type { FastifyReply } from 'fastify';

export const problem = (
  reply: FastifyReply,
  status: number,
  detail: string,
  type = 'invalid_request',
) => {
  reply.code(status).type('application/problem+json').send({
    type,
    title:
      status === 400
        ? 'Bad Request'
        : status === 401
          ? 'Unauthorized'
          : status === 403
            ? 'Forbidden'
            : status === 404
              ? 'Not Found'
              : 'Internal Server Error',
    status,
    detail,
  });
};
