import { CapabilityRegistry } from "../capabilities/CapabilityRegistry.js";
import { setActiveCapabilityRegistry } from "../capabilities/CapabilityRegistrar.js";

let registryPromise: Promise<CapabilityRegistry> | undefined;

export function createReactNativeCapabilityRegistry(): Promise<CapabilityRegistry> {
  registryPromise ??= initializeRegistry();
  return registryPromise;
}

async function initializeRegistry(): Promise<CapabilityRegistry> {
  const registry = new CapabilityRegistry();
  setActiveCapabilityRegistry(registry);

  try {
    await import("../capabilities/OpenApplicationCapability.js");
    await import("../capabilities/OpenSettingsCapability.js");
    await import("../capabilities/OpenUrlCapability.js");
    await import("../capabilities/ReadBatteryCapability.js");
    await import("../capabilities/ReadDeviceCapability.js");
    await import("../capabilities/ReadNetworkCapability.js");
  } finally {
    setActiveCapabilityRegistry(undefined);
  }

  return registry;
}