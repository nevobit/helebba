export type HealthStatus = 'ok' | 'degraded' | 'error';
export type ReadinessStatus = 'ready' | 'not_ready';

export interface DependencyHealth {
  readonly name: string;
  readonly status: 'ok' | 'error';
  readonly critical: boolean;
  readonly latencyMs?: number;
  readonly message?: string;
}

export interface ServiceMeta {
  readonly name: string;
  readonly version: string;
  readonly host: string;
  readonly env: string | undefined;
  readonly uptimeSeconds: number;
  readonly timestamp: string;
}

export interface LivenessPayload {
  readonly status: 'alive';
  readonly service: ServiceMeta;
  readonly requestId: string;
}

export interface ReadinessPayload {
  readonly status: ReadinessStatus;
  readonly service: ServiceMeta;
  readonly dependencies: readonly DependencyHealth[];
  readonly requestId: string;
}

export interface HealthPayload {
  readonly status: HealthStatus;
  readonly service: ServiceMeta;
  readonly dependencies: readonly DependencyHealth[];
  readonly requestId: string;
}

export interface HealthIndicatorResult {
  readonly name: string;
  readonly status: 'ok' | 'error';
  readonly critical: boolean;
  readonly latencyMs?: number;
  readonly message?: string;
}

export interface HealthIndicator {
  readonly name: string;
  readonly critical: boolean;
  check: () => Promise<HealthIndicatorResult>;
}
