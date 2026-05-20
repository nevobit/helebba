import client from "prom-client";

export const metricsRegistry = new client.Registry();

client.collectDefaultMetrics({
    register: metricsRegistry,
    prefix: "keystone_",
});

export const httpRequestCounter = new client.Counter({
    name: "keystone_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [metricsRegistry],
});

export const httpRequestDurationMs = new client.Histogram({
    name: "keystone_http_request_duration_ms",
    help: "HTTP request duration in milliseconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2000, 5000],
    registers: [metricsRegistry],
});

export const healthDependencyStatusGauge = new client.Gauge({
    name: "keystone_health_dependency_status",
    help: "Dependency health status where 1 = ok and 0 = error",
    labelNames: ["dependency", "critical"],
    registers: [metricsRegistry],
});

export const healthDependencyLatencyGauge = new client.Gauge({
    name: "keystone_health_dependency_latency_ms",
    help: "Dependency health check latency in milliseconds",
    labelNames: ["dependency", "critical"],
    registers: [metricsRegistry],
});