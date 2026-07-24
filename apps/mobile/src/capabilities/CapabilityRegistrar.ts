import type { Capability } from './Capability.js';
import { CapabilityRegistry } from './CapabilityRegistry.js';

const pendingRegistrations: Capability[] = [];
let activeRegistry: CapabilityRegistry | undefined;

export function setActiveCapabilityRegistry(registry: CapabilityRegistry | undefined): void {
  activeRegistry = registry;

  if (registry !== undefined && pendingRegistrations.length > 0) {
    for (const capability of pendingRegistrations) {
      registry.register(capability);
    }

    pendingRegistrations.length = 0;
  }
}

export function registerCapability(capability: Capability): void {
  if (activeRegistry !== undefined) {
    activeRegistry.register(capability);
    return;
  }

  pendingRegistrations.push(capability);
}
