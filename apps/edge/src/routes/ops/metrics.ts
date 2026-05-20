import type { RouteOptions } from "fastify";
import { metricsRegistry } from "../../adapters/metrics/registry";

export const metricsRoute: RouteOptions = {
    method: "GET",
    url: "/metrics",
    handler: async (_request, reply) => {
        reply.header("Content-Type", metricsRegistry.contentType);
        return reply.send(await metricsRegistry.metrics());
    },
};