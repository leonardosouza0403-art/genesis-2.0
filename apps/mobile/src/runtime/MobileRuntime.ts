import { CapabilityExecutor } from '../capabilities/CapabilityExecutor.js';
import { createCapabilityRegistry } from '../capabilities/CapabilityBootstrap.js';
import type { CapabilityRegistry } from '../capabilities/CapabilityRegistry.js';
import type { CapabilityExecutionResult } from '../capabilities/CapabilityExecutor.js';
import type { Capability } from '../capabilities/Capability.js';

export class MobileRuntime {
  private readonly registry: CapabilityRegistry;
  private readonly executor: CapabilityExecutor;

  private constructor(registry: CapabilityRegistry) {
    this.registry = registry;
    this.executor = new CapabilityExecutor(registry);
  }

  public static async create(): Promise<MobileRuntime> {
    const registry = await createCapabilityRegistry();
    return new MobileRuntime(registry);
  }

  public listCapabilities(): readonly Capability[] {
    return this.registry.list();
  }

  public getCapability(id: string): Capability | undefined {
    return this.registry.get(id);
  }

  public async executeCapability(id: string, params: Readonly<Record<string, unknown>>): Promise<CapabilityExecutionResult> {
    return this.executor.execute(id, params);
  }
}
