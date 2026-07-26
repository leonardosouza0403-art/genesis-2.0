import type {
  RuntimeAdapter,
  StorageAdapter
} from "@genesis/platform";

import { AiCore, LocalAiProvider } from "../ai/index.js";
import { GenesisBrain } from "../brain/index.js";
import { CognitiveEngine } from "../cognitive/index.js";
import { KnowledgeKernel } from "../knowledge/index.js";
import { MemoryKernel } from "../memory/index.js";
import {
  ReactNativeGenesisEngine,
  type NativeGenesisSnapshot
} from "../native/index.js";
import { GenesisOrchestrator } from "../orchestrator/index.js";

import type {
  GenesisKernelSnapshot,
  GenesisKernelStatus
} from "./GenesisKernelTypes.js";

export interface GenesisKernelOptions {
  readonly storage: StorageAdapter;
  readonly runtime: RuntimeAdapter;
}

export class GenesisKernel {
  private status: GenesisKernelStatus = "created";
  private startedAt: string | null = null;
  private stoppedAt: string | null = null;
  private error: string | null = null;

  private engine: ReactNativeGenesisEngine | null = null;
  private brain: GenesisBrain | null = null;

  public constructor(
    private readonly options: GenesisKernelOptions
  ) {}

  public async start(): Promise<GenesisKernelSnapshot> {
    if (this.status === "running") {
      return this.snapshot();
    }

    this.status = "starting";
    this.error = null;
    this.stoppedAt = null;

    try {
      const memory = new MemoryKernel(this.options.storage);
      const knowledge = new KnowledgeKernel(this.options.storage);
      const ai = new AiCore(
        this.options.storage,
        new LocalAiProvider()
      );
      const cognitive = new CognitiveEngine(
        this.options.storage,
        ai
      );

      this.engine = await ReactNativeGenesisEngine.initialize({
        storage: this.options.storage,
        runtime: this.options.runtime
      });

      const orchestrator = new GenesisOrchestrator({
        ai,
        cognitive,
        memory,
        knowledge,
        executeCapability: (id, params) =>
          this.requireEngine().executeCapability(id, params)
      });

      this.brain = new GenesisBrain(
        ai,
        cognitive,
        memory,
        knowledge,
        orchestrator
      );

      this.status = "running";
      this.startedAt = new Date().toISOString();

      return this.snapshot();
    } catch (error) {
      this.status = "failed";
      this.error =
        error instanceof Error
          ? error.message
          : String(error);

      return this.snapshot();
    }
  }

  public stop(): GenesisKernelSnapshot {
    this.status = "stopped";
    this.stoppedAt = new Date().toISOString();
    return this.snapshot();
  }

  public async think(
    conversationId: string,
    input: string
  ): Promise<string> {
    if (this.status !== "running" || this.brain === null) {
      throw new Error("GenesisKernel is not running.");
    }

    const result = await this.brain.think({
      conversationId,
      input,
      createdAt: new Date().toISOString()
    });

    if (!result.success) {
      throw new Error(result.response);
    }

    return result.response;
  }

  public snapshot(): GenesisKernelSnapshot {
    return {
      status: this.status,
      startedAt: this.startedAt,
      stoppedAt: this.stoppedAt,
      error: this.error,
      engine: this.engine?.snapshot() ?? null
    };
  }

  private requireEngine(): ReactNativeGenesisEngine {
    if (this.engine === null) {
      throw new Error("React Native engine is not initialized.");
    }

    return this.engine;
  }
}