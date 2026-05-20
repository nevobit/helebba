import type { DependencyHealth, HealthIndicator, HealthStatus } from '@hlb/contracts';

export interface ReadinessEvaluation {
  readonly ready: boolean;
  readonly dependencies: readonly DependencyHealth[];
}

export const evaluateReadiness = async (
  indicators: readonly HealthIndicator[],
): Promise<ReadinessEvaluation> => {
  const dependencies = await Promise.all(indicators.map((indicator) => indicator.check()));

  const ready = dependencies.every(
    (dependency) => !dependency.critical || dependency.status === 'ok',
  );

  return {
    ready,
    dependencies,
  };
};

export const deriveHealthStatus = (dependencies: readonly DependencyHealth[]): HealthStatus => {
  if (dependencies.every((dependency) => dependency.status === 'ok')) {
    return 'ok';
  }

  const hasCriticalFailure = dependencies.some(
    (dependency) => dependency.critical && dependency.status === 'error',
  );

  if (hasCriticalFailure) {
    return 'error';
  }

  return 'degraded';
};
