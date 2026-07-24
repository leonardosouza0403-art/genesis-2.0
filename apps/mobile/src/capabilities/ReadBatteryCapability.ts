import { isReactNativeRuntime, loadReactNativeRuntime } from '../platform/ReactNativeRuntime.js';
import { registerCapability } from './CapabilityRegistrar.js';
import { DeviceCapability } from './DeviceCapability.js';

export class ReadBatteryCapability extends DeviceCapability {
  public readonly id = 'read-battery';
  public readonly name = 'Read Battery';
  public readonly description = 'Reads the current battery level from the device.';
  public readonly permissions = ['android.permission.BATTERY_STATS'] as const;
  public readonly supportedPlatforms = ['android'] as const;
  public readonly categories: readonly import('./Capability.js').CapabilityCategory[] = ['device', 'health'];

  public constructor() {
    super();
    registerCapability(this);
  }

  public async isSupported(): Promise<boolean> {
    if (!isReactNativeRuntime()) {
      return false;
    }

    const { NativeModules, Platform } = await loadReactNativeRuntime();
    return Platform.OS === 'android' && NativeModules.BatteryModule !== undefined;
  }

  public async execute(): Promise<unknown> {
    const { NativeModules, Platform } = await loadReactNativeRuntime();

    if (Platform.OS !== 'android') {
      throw new Error('Battery reading is supported only on Android.');
    }

    const batteryModule = NativeModules.BatteryModule;

    if (batteryModule === undefined) {
      throw new Error('BatteryModule native module is unavailable.');
    }

    const batteryLevel = await batteryModule.getBatteryLevel();

    return { batteryLevel };
  }
}

export const readBatteryCapability = new ReadBatteryCapability();