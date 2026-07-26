import { CapabilityExecutor } from "../capabilities/CapabilityExecutor.js";
import type { CapabilityExecutionResult } from "../capabilities/CapabilityExecutor.js";
import type { CapabilityRegistry } from "../capabilities/CapabilityRegistry.js";
import { createReactNativeCapabilityRegistry } from "./ReactNativeCapabilityBootstrap.js";

export type NativeEngineStatus =
  | "starting"
  | "running"
  | "failed";

export interface NativeCapabilityDescriptor {
  readonly id: string;
  readonly name: string;
}

export interface NativeGenesisSnapshot {
  readonly online: boolean;
  readonly engineStatus: NativeEngineStatus;
  readonly memoryStatus: "ready";
  readonly sessionStatus: "active";
  readonly version: string;
  readonly bootTime: number;
  readonly uptimeMilliseconds: number;
  readonly sessionId: string;
  readonly capabilities: readonly NativeCapabilityDescriptor[];
}

function createSessionId(): string {
  const randomPart = Math.random().toString(36).slice(2);
  return `genesis-${Date.now()}-${randomPart}`;
}

export class ReactNativeGenesisEngine {
  private readonly bootTimestamp: number;
  private readonly currentSessionId: string;
  private readonly executor: CapabilityExecutor;

  private constructor(private readonly registry: CapabilityRegistry) {
    this.bootTimestamp = Date.now();
    this.currentSessionId = createSessionId();
    this.executor = new CapabilityExecutor(registry);
  }

  public static async initialize(): Promise<ReactNativeGenesisEngine> {
    const registry = await createReactNativeCapabilityRegistry();
    return new ReactNativeGenesisEngine(registry);
  }

  public snapshot(): NativeGenesisSnapshot {
    const capabilities = this.registry.list().map((capability) => ({
      id: capability.id,
      name: capability.name
    }));

    return {
      online: true,
      engineStatus: "running",
      memoryStatus: "ready",
      sessionStatus: "active",
      version: "2.0.0-alpha.2",
      bootTime: this.bootTimestamp,
      uptimeMilliseconds: Math.max(0, Date.now() - this.bootTimestamp),
      sessionId: this.currentSessionId,
      capabilities
    };
  }

  public executeCapability(
    id: string,
    params: Readonly<Record<string, unknown>> = {}
  ): Promise<CapabilityExecutionResult> {
    return this.executor.execute(id, params);
  }
}