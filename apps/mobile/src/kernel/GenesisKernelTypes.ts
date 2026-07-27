import type { NativeGenesisSnapshot } from "../native/index.js";

export type GenesisKernelStatus =
  | "created"
  | "starting"
  | "running"
  | "failed"
  | "stopped";

export interface GenesisKernelSnapshot {
  readonly status: GenesisKernelStatus;
  readonly startedAt: string | null;
  readonly stoppedAt: string | null;
  readonly error: string | null;
  readonly engine: NativeGenesisSnapshot | null;
}