import type {
  GenesisKernelSnapshot
} from "../kernel/index.js";

export type GenesisOSStatus =
  | "offline"
  | "booting"
  | "online"
  | "shutting-down"
  | "failed";

export interface GenesisOSSnapshot {
  readonly status: GenesisOSStatus;
  readonly bootStartedAt: string | null;
  readonly onlineAt: string | null;
  readonly shutdownAt: string | null;
  readonly error: string | null;
  readonly kernel: GenesisKernelSnapshot | null;
}