import type { RouteOptions } from "fastify";
import { getServiceMeta } from "../../adapters";
import { evaluateReadiness } from "../../adapters/ops/readiness";
import { healthDependencyLatencyGauge, healthDependencyStatusGauge } from "../../adapters/metrics/registry";
import { getHealthIndicators } from "../../adapters/ops/health-indicators";

export const readyRoute: RouteOptions = {
    method: "GET",
    url: "/ready",
    handler: async (request, reply) => {
            const readiness = await evaluateReadiness(getHealthIndicators());

            for (const dependency of readiness.dependencies) {
                healthDependencyStatusGauge.set(
                    {
                        dependency: dependency.name,
                        critical: String(dependency.critical),
                    },
                    dependency.status === "ok" ? 1 : 0,
                );

                if (typeof dependency.latencyMs === "number") {
                    healthDependencyLatencyGauge.set(
                        {
                            dependency: dependency.name,
                            critical: String(dependency.critical),
                        },
                        dependency.latencyMs,
                    );
                }
            }

        return reply.status(readiness.ready ? 200 : 503).send({
                status: readiness.ready ? "ready" : "not_ready",
                service: getServiceMeta(),
                dependencies: readiness.dependencies,
                requestId: request.id,
        });
    },
};