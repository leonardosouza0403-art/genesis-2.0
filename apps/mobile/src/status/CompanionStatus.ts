export type CompanionComponentStatus =
  | "running"
  | "active"
  | "ready"
  | "not-connected";

export interface CompanionStatusSnapshot {
  readonly online: boolean;
  readonly version: string;
  readonly uptimeMilliseconds: number;
  readonly companionStatus: CompanionComponentStatus;
  readonly engineStatus: CompanionComponentStatus;
  readonly memoryStatus: CompanionComponentStatus;
  readonly sessionStatus: CompanionComponentStatus;
  readonly capabilitiesCount: number;
}

export const companionVersion = "2.0.0-alpha.2" as const;

export function createCompanionStatus(
  startedAt: number,
  capabilitiesCount = 0
): CompanionStatusSnapshot {
  return {
    online: true,
    version: companionVersion,
    uptimeMilliseconds: Math.max(0, Date.now() - startedAt),
    companionStatus: "running",
    engineStatus: "not-connected",
    memoryStatus: "not-connected",
    sessionStatus: "active",
    capabilitiesCount
  };
}