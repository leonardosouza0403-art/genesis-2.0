import type {
  RuntimeAdapter,
  StorageAdapter
} from "@genesis/platform";

import {
  GenesisKernel,
  type GenesisKernelSnapshot
} from "../kernel/index.js";

import type {
  GenesisOSSnapshot,
  GenesisOSStatus
} from "./GenesisOSTypes.js";

export interface GenesisOSOptions {
  readonly storage: StorageAdapter;
  readonly runtime: RuntimeAdapter;
}

export class GenesisOS {
  private readonly kernel: GenesisKernel;

  private status: GenesisOSStatus = "offline";
  private bootStartedAt: string | null = null;
  private onlineAt: string | null = null;
  private shutdownAt: string | null = null;
  private error: string | null = null;
  private kernelSnapshot: GenesisKernelSnapshot | null = null;

  public constructor(options: GenesisOSOptions) {
    this.kernel = new GenesisKernel(options);
  }

  public async boot(): Promise<GenesisOSSnapshot> {
    if (this.status === "online") {
      return this.snapshot();
    }

    this.status = "booting";
    this.bootStartedAt = new Date().toISOString();
    this.shutdownAt = null;
    this.error = null;

    try {
      this.kernelSnapshot = await this.kernel.start();

      if (this.kernelSnapshot.status !== "running") {
        throw new Error(
          this.kernelSnapshot.error ??
          "Genesis Kernel failed to reach running state."
        );
      }

      this.status = "online";
      this.onlineAt = new Date().toISOString();
    } catch (error) {
      this.status = "failed";
      this.error =
        error instanceof Error
          ? error.message
          : String(error);
    }

    return this.snapshot();
  }

  public shutdown(): GenesisOSSnapshot {
    this.status = "shutting-down";
    this.error = null;

    try {
      this.kernelSnapshot = this.kernel.stop();
      this.status = "offline";
      this.shutdownAt = new Date().toISOString();
    } catch (error) {
      this.status = "failed";
      this.error =
        error instanceof Error
          ? error.message
          : String(error);
    }

    return this.snapshot();
  }

  public async think(
    conversationId: string,
    input: string
  ): Promise<string> {
    if (this.status !== "online") {
      throw new Error("Genesis OS is not online.");
    }

    return this.kernel.think(
      normalizeText(conversationId, "conversationId"),
      normalizeText(input, "input")
    );
  }

  public snapshot(): GenesisOSSnapshot {
    if (this.status === "online") {
      this.kernelSnapshot = this.kernel.snapshot();
    }

    return {
      status: this.status,
      bootStartedAt: this.bootStartedAt,
      onlineAt: this.onlineAt,
      shutdownAt: this.shutdownAt,
      error: this.error,
      kernel: this.kernelSnapshot
    };
  }

  public getKernel(): GenesisKernel {
    return this.kernel;
  }
}

function normalizeText(
  value: string,
  field: string
): string {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error(`${field} cannot be empty.`);
  }

  return normalized;
}