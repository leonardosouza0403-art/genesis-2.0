import { registerCapability } from './CapabilityRegistrar.js';
import { DeviceCapability } from './DeviceCapability.js';
import { Platform } from 'react-native';
import { NativeModules } from 'react-native';

const { DeviceInfoModule } = NativeModules as { readonly DeviceInfoModule?: { getDeviceInfo: () => Promise<Readonly<Record<string, unknown>>> } };

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
    return Platform.OS === 'android' && DeviceInfoModule !== undefined;
  }

  public async execute(): Promise<unknown> {
    if (DeviceInfoModule === undefined) {
      throw new Error('DeviceInfoModule native module is unavailable.');
    }

    const deviceInfo = await DeviceInfoModule.getDeviceInfo();

    return { deviceInfo };
  }
}

export const readDeviceCapability = new ReadDeviceCapability();
