import type { RouteOptions } from "fastify";
import { getServiceMeta } from "../../adapters";

export const liveRoute: RouteOptions = {
    method: "GET",
    url: "/live",
    handler: async (request, reply) => {
        return reply.status(200).send({
            status: "alive",
            service: getServiceMeta(),
            requestId: request.id,
        });
    },
};