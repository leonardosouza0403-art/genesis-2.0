import type {
  RuntimeAdapter,
  StorageAdapter
} from "@genesis/platform";

import {
  AutonomousAgent,
  type AgentSnapshot,
  type AgentTask,
  type AgentTaskRequest
} from "../agent/index.js";
import { AiCore, LocalAiProvider } from "../ai/index.js";
import { GenesisBrain } from "../brain/index.js";
import { CognitiveEngine } from "../cognitive/index.js";
import { KnowledgeKernel } from "../knowledge/index.js";
import { MemoryKernel } from "../memory/index.js";
import {
  ReactNativeGenesisEngine
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
  private agent: AutonomousAgent | null = null;

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

      this.agent = new AutonomousAgent(
        this.options.storage,
        {
          execute: (conversationId, objective) =>
            this.requireBrain()
              .think({
                conversationId,
                input: objective,
                createdAt: new Date().toISOString()
              })
              .then((result) => {
                if (!result.success) {
                  throw new Error(result.response);
                }

                return result.response;
              })
        }
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
    const result = await this.requireBrain().think({
      conversationId,
      input,
      createdAt: new Date().toISOString()
    });

    if (!result.success) {
      throw new Error(result.response);
    }

    return result.response;
  }

  public createAgentTask(
    request: AgentTaskRequest
  ): Promise<AgentTask> {
    return this.requireAgent().createTask(request);
  }

  public executeAgentTask(
    taskId: string,
    authorized = false
  ): Promise<AgentTask | null> {
    return this.requireAgent().executeTask(
      taskId,
      authorized
    );
  }

  public runNextAgentTask(
    authorizedTaskIds: readonly string[] = []
  ): Promise<AgentTask | null> {
    return this.requireAgent().runNext(
      authorizedTaskIds
    );
  }

  public cancelAgentTask(
    taskId: string
  ): Promise<AgentTask | null> {
    return this.requireAgent().cancelTask(taskId);
  }

  public agentSnapshot(): Promise<AgentSnapshot> {
    return this.requireAgent().snapshot();
  }

  public snapshot(): GenesisKernelSnapshot {
    return {
      status: this.status,
      startedAt: this.startedAt,
      stoppedAt: this.stoppedAt,
      error: this.error,
      engine: this.engine?.snapshot() ?? null,
      agent: null
    };
  }

  private requireEngine(): ReactNativeGenesisEngine {
    if (this.engine === null) {
      throw new Error(
        "React Native engine is not initialized."
      );
    }

    return this.engine;
  }

  private requireBrain(): GenesisBrain {
    if (
      this.status !== "running" ||
      this.brain === null
    ) {
      throw new Error(
        "GenesisKernel brain is not running."
      );
    }

    return this.brain;
  }

  private requireAgent(): AutonomousAgent {
    if (
      this.status !== "running" ||
      this.agent === null
    ) {
      throw new Error(
        "GenesisKernel agent is not running."
      );
    }

    return this.agent;
  }
}