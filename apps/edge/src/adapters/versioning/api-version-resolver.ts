import type { FastifyRequest } from "fastify";
import { API_CONFIG, API_VERSIONS, type ApiVersion } from "./api-versioning";

const isApiVersion = (value: string): value is ApiVersion => {
    return value === API_VERSIONS.V1 || value === API_VERSIONS.V2;
};

export const resolveApiVersion = (
    request: FastifyRequest,
): ApiVersion => {
    const headerVersion = request.headers["accept-version"];

    if (typeof headerVersion === "string" && isApiVersion(headerVersion)) {
        return headerVersion;
    }

    return API_CONFIG.DEFAULT_VERSION;
};