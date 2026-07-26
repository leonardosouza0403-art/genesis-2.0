export interface DashboardState {
  readonly online: boolean;
  readonly version: string;
  readonly uptime: number;
  readonly health: number;

  readonly kernelStatus: "running" | "stopped";
  readonly runtimeStatus: "running" | "stopped";
  readonly sessionStatus: "active" | "inactive";
  readonly memoryStatus: "loaded" | "unloaded";
  readonly lifecycleStatus: "running" | "stopped";
  readonly configurationStatus: "loaded" | "missing";

  readonly capabilitiesCount: number;
}

export function createDashboardState(): DashboardState {
  return {
    online: true,
    version: "2.0.0-alpha.2",
    uptime: 0,
    health: 100,
    kernelStatus: "running",
    runtimeStatus: "running",
    sessionStatus: "active",
    memoryStatus: "loaded",
    lifecycleStatus: "running",
    configurationStatus: "loaded",
    capabilitiesCount: 0
  };
}
