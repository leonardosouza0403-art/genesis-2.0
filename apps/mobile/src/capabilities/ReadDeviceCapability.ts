import { isReactNativeRuntime, loadReactNativeRuntime } from '../platform/ReactNativeRuntime.js';
import { registerCapability } from './CapabilityRegistrar.js';
import { DeviceCapability } from './DeviceCapability.js';

export class ReadDeviceCapability extends DeviceCapability {
  public readonly id = 'read-device';
  public readonly name = 'Read Device';
  public readonly description = 'Reads device meta information from native APIs.';
  public readonly permissions = ['android.permission.BLUETOOTH'] as const;
  public readonly supportedPlatforms = ['android'] as const;
  public readonly categories: readonly import('./Capability.js').CapabilityCategory[] = ['device', 'computer'];

  public constructor() {
    super();
    registerCapability(this);
  }

  public async isSupported(): Promise<boolean> {
    if (!isReactNativeRuntime()) {
      return false;
    }

    const { NativeModules, Platform } = await loadReactNativeRuntime();
    return Platform.OS === 'android' && NativeModules.DeviceInfoModule !== undefined;
  }

  public async execute(): Promise<unknown> {
    const { NativeModules, Platform } = await loadReactNativeRuntime();

    if (Platform.OS !== 'android') {
      throw new Error('Device information is supported only on Android.');
    }

    const deviceInfoModule = NativeModules.DeviceInfoModule;

    if (deviceInfoModule === undefined) {
      throw new Error('DeviceInfoModule native module is unavailable.');
    }

    const deviceInfo = await deviceInfoModule.getDeviceInfo();

    return { deviceInfo };
  }
}

export const readDeviceCapability = new ReadDeviceCapability();