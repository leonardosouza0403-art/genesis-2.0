import type { Capability } from './Capability.js';

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, Capability>();

  public register(capability: Capability): void {
    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability '${capability.id}' is already registered.`);
    }

    this.capabilities.set(capability.id, capability);
  }

  public get(id: string): Capability | undefined {
    return this.capabilities.get(id);
  }

  public list(): readonly Capability[] {
    return Array.from(this.capabilities.values());
  }
}
