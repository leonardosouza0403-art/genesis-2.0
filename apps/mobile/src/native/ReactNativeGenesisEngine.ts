import type {
  RuntimeAdapter,
  StorageAdapter
} from "@genesis/platform";

import { CapabilityExecutor } from "../capabilities/CapabilityExecutor.js";
import type { CapabilityExecutionResult } from "../capabilities/CapabilityExecutor.js";
import type { CapabilityRegistry } from "../capabilities/CapabilityRegistry.js";
import { KnowledgeKernel } from "../knowledge/index.js";
import type {
  KnowledgeNode,
  KnowledgeRelation
} from "../knowledge/index.js";
import { MemoryKernel } from "../memory/index.js";
import type {
  MemoryEntry,
  MemoryValue
} from "../memory/index.js";
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
  readonly knowledgeStatus: "ready";
  readonly sessionStatus: "active";
  readonly version: string;
  readonly platform: string;
  readonly runtimeVersion: string;
  readonly bootTime: number;
  readonly uptimeMilliseconds: number;
  readonly ownerId: string;
  readonly sessionId: string;
  readonly bootCount: number;
  readonly memoryCount: number;
  readonly knowledgeCount: number;
  readonly capabilities: readonly NativeCapabilityDescriptor[];
}

export interface ReactNativeGenesisEngineOptions {
  readonly storage: StorageAdapter;
  readonly runtime: RuntimeAdapter;
}

interface PersistedIdentity {
  readonly ownerId: string;
  readonly createdAt: string;
}

const IdentityKey = "genesis.identity";
const CurrentSessionKey = "genesis.currentSession";
const BootCountKey = "genesis.bootCount";
const Version = "2.0.0-alpha.2";

function createIdentifier(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now()}-${randomPart}`;
}

export class ReactNativeGenesisEngine {
  private readonly bootTimestamp: number;
  private readonly executor: CapabilityExecutor;
  private readonly memory: MemoryKernel;
  private readonly knowledge: KnowledgeKernel;

  private memoryEntryCount: number;
  private knowledgeNodeCount: number;

  private constructor(
    private readonly registry: CapabilityRegistry,
    private readonly storage: StorageAdapter,
    private readonly runtime: RuntimeAdapter,
    private readonly ownerIdentifier: string,
    private readonly currentSessionId: string,
    private readonly currentBootCount: number,
    memoryEntryCount: number,
    knowledgeNodeCount: number
  ) {
    this.bootTimestamp = Date.now();
    this.executor = new CapabilityExecutor(registry);
    this.memory = new MemoryKernel(storage);
    this.knowledge = new KnowledgeKernel(storage);
    this.memoryEntryCount = memoryEntryCount;
    this.knowledgeNodeCount = knowledgeNodeCount;
  }

  public static async initialize(
    options: ReactNativeGenesisEngineOptions
  ): Promise<ReactNativeGenesisEngine> {
    const registry = await createReactNativeCapabilityRegistry();
    const identity = await loadOrCreateIdentity(options.storage);
    const sessionId = createIdentifier("session");
    const bootCount = await incrementBootCount(options.storage);

    const memory = new MemoryKernel(options.storage);
    const knowledge = new KnowledgeKernel(options.storage);

    const [memorySnapshot, knowledgeSnapshot] = await Promise.all([
      memory.snapshot(),
      knowledge.snapshot()
    ]);

    await options.storage.set(
      CurrentSessionKey,
      JSON.stringify({
        sessionId,
        ownerId: identity.ownerId,
        startedAt: new Date().toISOString(),
        bootCount
      })
    );

    return new ReactNativeGenesisEngine(
      registry,
      options.storage,
      options.runtime,
      identity.ownerId,
      sessionId,
      bootCount,
      memorySnapshot.count,
      knowledgeSnapshot.nodes.length
    );
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
      knowledgeStatus: "ready",
      sessionStatus: "active",
      version: Version,
      platform: this.runtime.platform,
      runtimeVersion: this.runtime.version,
      bootTime: this.bootTimestamp,
      uptimeMilliseconds: Math.max(0, Date.now() - this.bootTimestamp),
      ownerId: this.ownerIdentifier,
      sessionId: this.currentSessionId,
      bootCount: this.currentBootCount,
      memoryCount: this.memoryEntryCount,
      knowledgeCount: this.knowledgeNodeCount,
      capabilities
    };
  }

  public async remember(
    key: string,
    value: MemoryValue
  ): Promise<MemoryEntry> {
    const entry = await this.memory.remember(key, value);
    const snapshot = await this.memory.snapshot();
    this.memoryEntryCount = snapshot.count;
    return entry;
  }

  public recall(key: string): Promise<MemoryEntry | null> {
    return this.memory.recall(key);
  }

  public async forget(key: string): Promise<boolean> {
    const removed = await this.memory.forget(key);
    const snapshot = await this.memory.snapshot();
    this.memoryEntryCount = snapshot.count;
    return removed;
  }

  public async addKnowledgeNode(
    node: KnowledgeNode
  ): Promise<void> {
    await this.knowledge.addNode(node);
    const snapshot = await this.knowledge.snapshot();
    this.knowledgeNodeCount = snapshot.nodes.length;
  }

  public addKnowledgeRelation(
    relation: KnowledgeRelation
  ): Promise<void> {
    return this.knowledge.addRelation(relation);
  }

  public searchKnowledge(text: string): Promise<KnowledgeNode[]> {
    return this.knowledge.search(text);
  }

  public executeCapability(
    id: string,
    params: Readonly<Record<string, unknown>> = {}
  ): Promise<CapabilityExecutionResult> {
    return this.executor.execute(id, params);
  }
}

async function loadOrCreateIdentity(
  storage: StorageAdapter
): Promise<PersistedIdentity> {
  const storedIdentity = await storage.get(IdentityKey);

  if (storedIdentity !== null) {
    try {
      const parsed = JSON.parse(storedIdentity) as PersistedIdentity;

      if (
        typeof parsed.ownerId === "string" &&
        typeof parsed.createdAt === "string"
      ) {
        return parsed;
      }
    } catch {
      await storage.remove(IdentityKey);
    }
  }

  const identity: PersistedIdentity = {
    ownerId: createIdentifier("owner"),
    createdAt: new Date().toISOString()
  };

  await storage.set(IdentityKey, JSON.stringify(identity));

  return identity;
}

async function incrementBootCount(
  storage: StorageAdapter
): Promise<number> {
  const storedValue = await storage.get(BootCountKey);
  const previousValue =
    storedValue === null ? 0 : Number.parseInt(storedValue, 10);

  const nextValue =
    Number.isFinite(previousValue) ? previousValue + 1 : 1;

  await storage.set(BootCountKey, String(nextValue));

  return nextValue;
}