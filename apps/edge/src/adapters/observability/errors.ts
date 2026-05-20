import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export interface ErrorResponsePayload {
    readonly error: {
        readonly code: string;
        readonly message: string;
        readonly requestId: string;
    };
}

export const registerErrorHandler = (app: FastifyInstance): void => {
    app.setErrorHandler(
        (
            error: FastifyError,
            request: FastifyRequest,
            reply: FastifyReply,
        ) => {
            const statusCode =
                typeof error.statusCode === "number" && error.statusCode >= 400
                    ? error.statusCode
                    : 500;

            request.log.error(
                {
                    err: error,
                    statusCode,
                },
                "Unhandled request error",
            );

            const payload: ErrorResponsePayload = {
                error: {
                    code: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
                    message:
                        statusCode >= 500
                            ? "An unexpected error occurred"
                            : error.message,
                    requestId: request.id,
                },
            };

            void reply.status(statusCode).send(payload);
        },
    );
};