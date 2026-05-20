import type { FastifyBaseLogger } from "fastify";
import { requestContext } from "./request-context";

export const withRequestLogContext = (
    logger: FastifyBaseLogger,
): FastifyBaseLogger => {
    const context = requestContext.get();

    if (!context) {
        return logger;
    }

    return logger.child({
        requestId: context.requestId,
        tenantId: context.tenantId,
        userId: context.userId,
        path: context.path,
        method: context.method,
    });
};