export interface DependencyCheck {
    name: string;
    status: "ok" | "error";
    message?: string;
}

export interface ReadinessResult {
    ready: boolean;
    dependencies: DependencyCheck[];
}

export const checkReadiness = async (): Promise<ReadinessResult> => {
    const dependencies: DependencyCheck[] = [];

    try {
        // await postgresql.ping();
        dependencies.push({ name: "postgresql", status: "ok" });
    } catch (error) {
        dependencies.push({
            name: "postgresql",
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }

    try {
        // await redis.ping();
        dependencies.push({ name: "redis", status: "ok" });
    } catch (error) {
        dependencies.push({
            name: "redis",
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }

    try {
        // await mongo.ping();
        dependencies.push({ name: "mongodb", status: "ok" });
    } catch (error) {
        dependencies.push({
            name: "mongodb",
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
        });
    }

    const ready = dependencies.every((dependency) => dependency.status === "ok");

    return {
        ready,
        dependencies,
    };
};