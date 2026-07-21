import { ModuleState, HealthStatus } from '@genesis/contracts';

export class HealthService {
  public aggregate(states: ReadonlyArray<ModuleState>): HealthStatus {
    if (states.length === 0) {
      return HealthStatus.Healthy;
    }

    if (states.includes(ModuleState.Failed)) {
      return HealthStatus.Unhealthy;
    }

    if (states.includes(ModuleState.Stopped) || states.includes(ModuleState.Initializing)) {
      return HealthStatus.Degraded;
    }

    return HealthStatus.Healthy;
  }
}
