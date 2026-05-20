export const API_VERSIONS = {
    V1: "v1",
    V2: "v2",
} as const;

export type ApiVersion =
    (typeof API_VERSIONS)[keyof typeof API_VERSIONS];

export const API_VISIBILITY = {
    PUBLIC: "public",
    INTERNAL: "internal",
} as const;

export type ApiVisibility =
    (typeof API_VISIBILITY)[keyof typeof API_VISIBILITY];

export interface ApiVersionDefinition {
    readonly version: ApiVersion;
    readonly deprecated: boolean;
    readonly sunsetAt?: string;
    readonly visibility: ApiVisibility;
    readonly default: boolean;
}

export const apiVersionRegistry: Record<ApiVersion, ApiVersionDefinition> = {
    [API_VERSIONS.V1]: {
        version: API_VERSIONS.V1,
        deprecated: false,
        visibility: API_VISIBILITY.PUBLIC,
        default: true,
    },
    [API_VERSIONS.V2]: {
        version: API_VERSIONS.V2,
        deprecated: false,
        visibility: API_VISIBILITY.PUBLIC,
        default: false,
    },
} as const;

export const API_CONFIG = {
    BASE_PATH: "/api",
    DEFAULT_VERSION: API_VERSIONS.V1,
} as const;

export const buildApiPrefix = (options?: {
    version?: ApiVersion;
    service?: string;
}) => {
    const version = options?.version ?? API_CONFIG.DEFAULT_VERSION;
    const service = options?.service?.trim();

    if (service) {
        return `${API_CONFIG.BASE_PATH}/${version}/${service}`;
    }

    return `${API_CONFIG.BASE_PATH}/${version}`;
};

export const getApiVersionDefinition = (
    version: ApiVersion,
): ApiVersionDefinition => {
    return apiVersionRegistry[version];
};

export const isDeprecatedApiVersion = (version: ApiVersion): boolean => {
    return apiVersionRegistry[version].deprecated;
};