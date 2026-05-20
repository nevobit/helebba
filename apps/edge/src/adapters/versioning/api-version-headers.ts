import type { FastifyReply, FastifyRequest } from "fastify";
import { API_CONFIG, API_VERSIONS, getApiVersionDefinition } from "./api-versioning";


const extractVersionFromPath = (url: string): string | null => {
    const normalizedUrl = url.split("?")[0];
    const segments = normalizedUrl.split("/").filter(Boolean);

    if (segments.length < 2) {
        return null;
    }

    if (segments[0] !== API_CONFIG.BASE_PATH.replace("/", "")) {
        return null;
    }

    return segments[1] ?? null;
};

export const apiVersionHeadersHook = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    const version = extractVersionFromPath(request.url);

    if (!version) {
        return;
    }

    if (
        version !== API_VERSIONS.V1 &&
        version !== API_VERSIONS.V2
    ) {
        return;
    }

    const definition = getApiVersionDefinition(version);

    reply.header("X-API-Version", definition.version);

    if (definition.deprecated) {
        reply.header("Deprecation", "true");

        if (definition.sunsetAt) {
            reply.header("Sunset", definition.sunsetAt);
        }
    }
};